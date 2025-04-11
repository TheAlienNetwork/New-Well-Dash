import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertWellInfoSchema,
  insertSurveySchema,
  insertCurveDataSchema,
  insertGammaDataSchema,
  insertEmailDistributionSchema,
  insertWitsMappingSchema,
  insertDrillingParamSchema
} from "@shared/schema";
import { witsManager } from './wits/wits-manager';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { spawn } from 'child_process';
import path from 'path';

// Interval-based data simulator for demo purposes
let witsSimulationInterval: NodeJS.Timeout | null = null;
const activeConnections = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for WITS data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Set up the broadcast function in witsManager
  const broadcastFunction = (message: any) => {
    broadcastMessage(message);
  };
  witsManager.setBroadcastFunction(broadcastFunction);

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    activeConnections.add(ws);

    // Start simulation if it's not already running
    if (!witsSimulationInterval) {
      startWitsSimulation();
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'wits_config') {
          console.log('WITS configuration received:', data);

          // Extract configuration from the message
          const config = data.data?.config;
          if (config) {
            try {
              const { host, port } = config;
              // Connect to WITS server
              await witsManager.connectWits(host, port);

              // Send success response
              ws.send(JSON.stringify({
                type: 'wits_config_response',
                status: 'success',
                message: `Connected to WITS server at ${host}:${port}`
              }));
            } catch (err) {
              console.error('Failed to connect to WITS server:', err);
              ws.send(JSON.stringify({
                type: 'wits_config_response',
                status: 'error',
                message: 'Failed to connect to WITS server'
              }));
            }
          }
        }

        if (data.type === 'wits_simulation_toggle') {
          const isSimulated = data.data?.isSimulated;
          console.log('WITS simulation toggle:', isSimulated ? 'SIMULATED' : 'REAL');

          if (isSimulated === true) {
            // Enable simulation mode
            if (!witsSimulationInterval) {
              startWitsSimulation();
            }

            // Tell WITS client to use simulation mode
            witsManager.witsClient.setSimulationMode(true);

            // Update status for all clients
            broadcastMessage({
              type: 'wits_status',
              data: {
                connected: true,
                address: 'SIMULATION MODE',
                lastData: new Date(),
                isSimulated: true
              }
            });

            ws.send(JSON.stringify({
              type: 'wits_simulation_toggle_response',
              status: 'success',
              message: 'WITS simulation started'
            }));
          } else if (isSimulated === false) {
            // Disable simulation
            if (witsSimulationInterval) {
              clearInterval(witsSimulationInterval);
              witsSimulationInterval = null;
            }

            // Tell WITS client to use real mode
            witsManager.witsClient.setSimulationMode(false);

            // Update status for all clients
            const status = witsManager.getStatus();
            broadcastMessage({
              type: 'wits_status',
              data: {
                ...status,
                isSimulated: false
              }
            });

            ws.send(JSON.stringify({
              type: 'wits_simulation_toggle_response',
              status: 'success',
              message: 'WITS simulation stopped'
            }));
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      activeConnections.delete(ws);

      // Stop simulation if no clients are connected
      if (activeConnections.size === 0 && witsSimulationInterval) {
        clearInterval(witsSimulationInterval);
        witsSimulationInterval = null;
      }
    });

    // Send initial state
    sendInitialState(ws);
  });

  // API routes - prefix all with /api
  const router = express.Router();

  // Well Info Routes
  router.get('/well-info', async (req: Request, res: Response) => {
    try {
      const wells = await storage.getAllWellInfo();
      res.json(wells);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve well information' });
    }
  });

  router.get('/well-info/:id', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.id);
      const well = await storage.getWellInfo(wellId);

      if (!well) {
        return res.status(404).json({ error: 'Well not found' });
      }

      res.json(well);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve well information' });
    }
  });

  router.post('/well-info', async (req: Request, res: Response) => {
    try {
      const validatedData = insertWellInfoSchema.parse(req.body);
      const well = await storage.createWellInfo(validatedData);
      res.status(201).json(well);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create well information' });
    }
  });

  router.patch('/well-info/:id', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.id);

      console.log('Well info PATCH request received:', req.body);

      // With our updated schema, we can directly validate the input
      // The schema will handle the type conversion as needed
      const validatedData = insertWellInfoSchema.partial().parse(req.body);
      console.log('Validated data:', validatedData);

      const updated = await storage.updateWellInfo(wellId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Well not found' });
      }

      res.json(updated);

      // Broadcast update to all connected clients
      broadcastWellInfoUpdate(updated);
    } catch (error) {
      console.error('Error updating well info:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update well information' });
    }
  });

  // Survey Routes
  router.get('/surveys/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const surveys = await storage.getSurveysByWellId(wellId);
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve surveys' });
    }
  });

  router.post('/surveys', async (req: Request, res: Response) => {
    try {
      // We won't use omit since it's causing type conflicts
      // Instead validate the required fields directly
      const validatedData = z.object({
        md: z.string(),
        inc: z.string(),
        azi: z.string(),
        bitDepth: z.string(),
        wellId: z.number(),
        gTotal: z.string().nullable().optional(),
        bTotal: z.string().nullable().optional(),
        dipAngle: z.string().nullable().optional(),
        toolFace: z.string().nullable().optional(),
        notes: z.string().nullable().optional()
      }).parse(req.body);

      const survey = await storage.createSurvey(validatedData);
      res.status(201).json(survey);

      // Broadcast new survey to all connected clients
      broadcastSurveyUpdate('created', survey);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create survey' });
    }
  });

  router.patch('/surveys/:id', async (req: Request, res: Response) => {
    try {
      const surveyId = parseInt(req.params.id);

      // Use the same approach as in POST but make all fields optional
      const validatedData = z.object({
        md: z.string().optional(),
        inc: z.string().optional(),
        azi: z.string().optional(),
        bitDepth: z.string().optional(),
        wellId: z.number().optional(),
        gTotal: z.string().nullable().optional(),
        bTotal: z.string().nullable().optional(),
        dipAngle: z.string().nullable().optional(),
        toolFace: z.string().nullable().optional(),
        notes: z.string().nullable().optional()
      }).parse(req.body);

      const updated = await storage.updateSurvey(surveyId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      res.json(updated);

      // Broadcast update to all connected clients
      broadcastSurveyUpdate('updated', updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update survey' });
    }
  });

  router.delete('/surveys/:id', async (req: Request, res: Response) => {
    try {
      const surveyId = parseInt(req.params.id);

      // Get the survey first to know its wellId for broadcasting
      const survey = await storage.getSurvey(surveyId);

      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      const deleted = await storage.deleteSurvey(surveyId);

      if (!deleted) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      res.status(204).send();

      // Broadcast deletion to all connected clients
      broadcastSurveyUpdate('deleted', survey);

      // Refresh all surveys to update indices
      const updatedSurveys = await storage.getSurveysByWellId(survey.wellId);
      broadcastFullSurveyList(survey.wellId, updatedSurveys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete survey' });
    }
  });

  // Curve Data Routes
  router.get('/curve-data/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const curveData = await storage.getCurveDataByWellId(wellId);

      if (!curveData) {
        return res.status(404).json({ error: 'Curve data not found' });
      }

      res.json(curveData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve curve data' });
    }
  });

  router.post('/curve-data', async (req: Request, res: Response) => {
    try {
      const validatedData = insertCurveDataSchema.parse(req.body);
      const curveData = await storage.createCurveData(validatedData);
      res.status(201).json(curveData);

      // Broadcast update to all connected clients
      broadcastCurveDataUpdate(curveData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create curve data' });
    }
  });

  router.patch('/curve-data/:id', async (req: Request, res: Response) => {
    try {
      const curveId = parseInt(req.params.id);
      console.log('Curve data PATCH request received:', req.body);

      // Log the schema requirements
      console.log('Schema fields:', Object.keys(insertCurveDataSchema.shape));

      const validatedData = insertCurveDataSchema.partial().parse(req.body);
      console.log('Validated data:', validatedData);

      const updated = await storage.updateCurveData(curveId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Curve data not found' });
      }

      res.json(updated);

      // Broadcast update to all connected clients
      broadcastCurveDataUpdate(updated);

      // Get latest survey and broadcast direction info
      const surveys = await storage.getSurveysByWellId(updated.wellId);
      const latestSurvey = surveys[surveys.length - 1];

      if (latestSurvey) {
        broadcastMessage({
          type: 'directional_update',
          data: {
            projectedInc: updated.projectedInc,
            projectedAz: updated.projectedAz,
            currentInc: latestSurvey.inc,
            currentAz: latestSurvey.azi
          }
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update curve data' });
    }
  });

  // Gamma Data Routes
  router.get('/gamma-data/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const gammaData = await storage.getGammaDataByWellId(wellId);
      res.json(gammaData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve gamma data' });
    }
  });

  router.post('/gamma-data', async (req: Request, res: Response) => {
    try {
      const validatedData = insertGammaDataSchema.parse(req.body);
      const gammaData = await storage.createGammaData(validatedData);
      res.status(201).json(gammaData);

      // Broadcast update to all connected clients
      broadcastGammaDataUpdate(gammaData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create gamma data' });
    }
  });

  // Bulk gamma data import
  router.post('/gamma-data/bulk', async (req: Request, res: Response) => {
    try {
      const { wellId, data } = req.body;

      if (!Array.isArray(data) || !wellId) {
        return res.status(400).json({ error: 'Invalid request format. Expected wellId and data array.' });
      }

      // Process in batches
      const results = [];
      let inserted = 0;

      for (const item of data) {
        try {
          const validatedData = insertGammaDataSchema.parse({
            ...item,
            wellId: parseInt(wellId) // Ensure wellId is set correctly
          });

          const gammaPoint = await storage.createGammaData(validatedData);

          if (gammaPoint) {
            inserted++;
            results.push(gammaPoint);

            // Broadcast update to all connected clients
            broadcastGammaDataUpdate(gammaPoint);
          }
        } catch (error) {
          console.error('Error importing gamma point:', error);
          // Continue with next item even if this one failed
        }
      }

      res.status(201).json({ 
        message: `Successfully imported ${inserted} of ${data.length} gamma points`,
        inserted,
        total: data.length
      });
    } catch (error) {
      console.error('Bulk gamma import error:', error);
      res.status(500).json({ error: 'Failed to process bulk gamma data import' });
    }
  });

  // Email Distribution Routes
  router.get('/email-distributions/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const distributions = await storage.getEmailDistributionsByWellId(wellId);
      res.json(distributions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve email distributions' });
    }
  });

  router.post('/email-distributions', async (req: Request, res: Response) => {
    try {
      const validatedData = insertEmailDistributionSchema.parse(req.body);
      const distribution = await storage.createEmailDistribution(validatedData);
      res.status(201).json(distribution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create email distribution' });
    }
  });

  router.patch('/email-distributions/:id', async (req: Request, res: Response) => {
    try {
      const distId = parseInt(req.params.id);
      const validatedData = insertEmailDistributionSchema.partial().parse(req.body);

      const updated = await storage.updateEmailDistribution(distId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Email distribution not found' });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update email distribution' });
    }
  });

  router.delete('/email-distributions/:id', async (req: Request, res: Response) => {
    try {
      const distId = parseInt(req.params.id);
      const deleted = await storage.deleteEmailDistribution(distId);

      if (!deleted) {
        return res.status(404).json({ error: 'Email distribution not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete email distribution' });
    }
  });

  // WITS Mapping Routes
  router.get('/wits-mappings/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const mappings = await storage.getWitsMappingsByWellId(wellId);
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve WITS mappings' });
    }
  });

  router.post('/wits-mappings', async (req: Request, res: Response) => {
    try {
      const validatedData = insertWitsMappingSchema.parse(req.body);
      const mapping = await storage.createWitsMapping(validatedData);
      res.status(201).json(mapping);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create WITS mapping' });
    }
  });

  router.patch('/wits-mappings/:id', async (req: Request, res: Response) => {
    try {
      const mappingId = parseInt(req.params.id);
      const validatedData = insertWitsMappingSchema.partial().parse(req.body);

      const updated = await storage.updateWitsMapping(mappingId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'WITS mapping not found' });
      }

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update WITS mapping' });
    }
  });

  router.delete('/wits-mappings/:id', async (req: Request, res: Response) => {
    try {
      const mappingId = parseInt(req.params.id);
      const deleted = await storage.deleteWitsMapping(mappingId);

      if (!deleted) {
        return res.status(404).json({ error: 'WITS mapping not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete WITS mapping' });
    }
  });

  // Drilling Parameters Routes
  router.get('/drilling-params/:wellId', async (req: Request, res: Response) => {
    try {
      const wellId = parseInt(req.params.wellId);
      const params = await storage.getDrillingParamsByWellId(wellId);
      res.json(params);
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve drilling parameters' });
    }
  });

  router.post('/drilling-params', async (req: Request, res: Response) => {
    try {
      const validatedData = insertDrillingParamSchema.parse(req.body);
      const param = await storage.createDrillingParam(validatedData);
      res.status(201).json(param);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to create drilling parameter' });
    }
  });

  router.patch('/drilling-params/:id', async (req: Request, res: Response) => {
    try {
      const paramId = parseInt(req.params.id);
      const validatedData = insertDrillingParamSchema.partial().parse(req.body);

      const updated = await storage.updateDrillingParam(paramId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Drilling parameter not found' });
      }

      res.json(updated);

      // Broadcast update to all connected clients
      broadcastDrillingParamUpdate(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: 'Failed to update drilling parameter' });
    }
  });

  router.delete('/drilling-params/:id', async (req: Request, res: Response) => {
    try {
      const paramId = parseInt(req.params.id);
      const deleted = await storage.deleteDrillingParam(paramId);

      if (!deleted) {
        return res.status(404).json({ error: 'Drilling parameter not found' });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete drilling parameter' });
    }
  });

  // WITS Routes
  router.post('/wits/connect', async (req: Request, res: Response) => {
    try {
      const { host, port } = req.body;
      witsManager.connectWits(host, port);
      res.json({ message: 'WITS connection initiated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to connect to WITS server' });
    }
  });

  router.post('/witsml/connect', async (req: Request, res: Response) => {
    try {
      const { url, username, password } = req.body;
      // Currently the manager doesn't support WITSML connections directly
      // Send an informative response to the client
      res.json({ 
        message: 'WITSML connection not implemented in current version',
        info: 'Please use WITS connection instead'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process WITSML connection request' });
    }
  });

  // Outlook automation endpoint
  router.post('/api/outlook-compose', async (req, res) => {
    try {
      const { recipients, subject, body, attachments } = req.body;

      // Spawn Python process with output handling
      const pythonProcess = spawn('python', [
        path.join(__dirname, 'outlook_automation.py'),
        JSON.stringify({
          recipients,
          subject,
          body,
          attachments: attachments || []
        })
      ]);

      let outputData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(outputData);
            res.json(result);
          } catch (e) {
            res.status(500).json({ error: 'Failed to parse Python output' });
          }
        } else {
          res.status(500).json({ error: 'Outlook automation failed' });
        }
      });

      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        res.status(500).json({ error: 'Failed to start Outlook automation' });
      });

      pythonProcess.on('exit', (code) => {
        if (code === 0) {
          res.json({ success: true });
        } else {
          res.status(500).json({ error: 'Outlook automation failed' });
        }
      });
    } catch (error) {
      console.error('Error in Outlook automation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Mount the router
  app.use('/api', router);

  return httpServer;
}

// Helpers for WebSocket communication
async function sendInitialState(ws: WebSocket) {
  try {
    // Send well info
    const wells = await storage.getAllWellInfo();
    if (wells.length > 0) {
      const defaultWell = wells[0]; // Use first well as default

      ws.send(JSON.stringify({
        type: 'well_info',
        data: defaultWell
      }));

      // Send surveys for this well
      const surveys = await storage.getSurveysByWellId(defaultWell.id);
      ws.send(JSON.stringify({
        type: 'surveys',
        data: surveys
      }));

      // Send curve data
      const curveData = await storage.getCurveDataByWellId(defaultWell.id);
      if (curveData) {
        ws.send(JSON.stringify({
          type: 'curve_data',
          data: curveData
        }));
      }

      // Send gamma data
      const gammaData = await storage.getGammaDataByWellId(defaultWell.id);
      ws.send(JSON.stringify({
        type: 'gamma_data',
        data: gammaData
      }));

      // Send drilling parameters
      const drillingParams = await storage.getDrillingParamsByWellId(defaultWell.id);
      ws.send(JSON.stringify({
        type: 'drilling_params',
        data: drillingParams
      }));

      // Send wits connection status
      ws.send(JSON.stringify({
        type: 'wits_status',
        connected: true,
        address: 'SIMULATION MODE',
        isSimulated: true
      }));
    }
  } catch (error) {
    console.error('Error sending initial state:', error);
  }
}

function broadcastMessage(message: any) {
  activeConnections.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function broadcastWellInfoUpdate(wellInfo: any) {
  broadcastMessage({
    type: 'well_info',
    data: wellInfo
  });
}

function broadcastSurveyUpdate(action: 'created' | 'updated' | 'deleted', survey: any) {
  broadcastMessage({
    type: 'survey_update',
    action,
    data: survey
  });
}

function broadcastFullSurveyList(wellId: number, surveys: any[]) {
  broadcastMessage({
    type: 'surveys',
    wellId,
    data: surveys
  });
}

function broadcastCurveDataUpdate(curveData: any) {
  broadcastMessage({
    type: 'curve_data',
    data: curveData
  });
}

function broadcastGammaDataUpdate(gammaData: any) {
  broadcastMessage({
    type: 'gamma_data_update',
    data: gammaData
  });
}

function broadcastDrillingParamUpdate(param: any) {
  broadcastMessage({
    type: 'drilling_param_update',
    data: param
  });
}

// Simulate WITS data for demo purposes
function startWitsSimulation() {
  if (witsSimulationInterval) {
    clearInterval(witsSimulationInterval);
  }

  console.log('Starting WITS simulation');

  interface ChannelConfig {
    name: string;
    min: number;
    max: number;
    unit: string;
    increment: number;
  }

  const channelMap: Record<string, ChannelConfig> = {
    '1': { name: 'Bit Depth', min: 8500, max: 12000, unit: 'ft', increment: 0.1 },
    '2': { name: 'Weight on Bit', min: 10, max: 35, unit: 'klbs', increment: 0.5 },
    '3': { name: 'Rate of Penetration', min: 15, max: 75, unit: 'ft/hr', increment: 5 },
    '4': { name: 'Standpipe Pressure', min: 1800, max: 3200, unit: 'psi', increment: 50 },
    '5': { name: 'Flow Rate', min: 400, max: 650, unit: 'gpm', increment: 10 },
    '6': { name: 'Rotary Speed', min: 40, max: 120, unit: 'rpm', increment: 5 },
    '7': { name: 'Torque', min: 5, max: 15, unit: 'kft-lbs', increment: 0.5 },
    '8': { name: 'Hook Load', min: 250, max: 350, unit: 'klbs', increment: 5 },
    '9': { name: 'Temperature', min: 120, max: 180, unit: '°F', increment: 2 },
    '10': { name: 'MWD Inclination', min: 0, max: 90, unit: '°', increment: 0.5 },
    '11': { name: 'Gamma', min: 20, max: 150, unit: 'API', increment: 5 },
    '12': { name: 'MWD Azimuth', min: 0, max: 359, unit: '°', increment: 2 }
  };

  // Store the current simulated values
  const currentValues: Record<number, number> = {};

  // Initialize with random values within range
  Object.keys(channelMap).forEach(key => {
    const channel = parseInt(key);
    const config = channelMap[key];
    currentValues[channel] = config.min + Math.random() * (config.max - config.min);
  });

  // Send initial values
  Object.keys(currentValues).forEach(key => {
    const channelStr = key.toString();
    const channel = parseInt(channelStr);
    const channelConfig = channelMap[channel.toString()];
    broadcastMessage({
      type: 'wits_data',
      data: {
        recordId: 1,
        channelId: channel,
        value: currentValues[channel],
        timestamp: new Date(),
        mappedName: channelConfig.name,
        unit: channelConfig.unit
      }
    });
  });

  // Broadcast a fake status message
  broadcastMessage({
    type: 'wits_status',
    data: {
      connected: true,
      address: 'simulated-server:8080',
      lastData: new Date()
    }
  });

  // Update the values and broadcast at a regular interval
  witsSimulationInterval = setInterval(() => {
    // Generate random channels to update (not all at once)
    const channelsToUpdate = Math.floor(Math.random() * 4) + 1; // 1-4 channels
    const channelsArr = Object.keys(channelMap).map(k => parseInt(k));

    // Shuffle and take a subset
    const shuffled = channelsArr.sort(() => 0.5- Math.random());
    const selectedChannels = shuffled.slice(0, channelsToUpdate);

    // Update each selected channel
    selectedChannels.forEach(channel => {
      const channelStr = channel.toString();
      const config = channelMap[channelStr];

      if (!config) {
        console.error(`Invalid channel config for channel ${channel}`);
        return; // Skip this channel
      }

      // Add some randomness to the change direction with bias toward the middle of the range
      const mean = (config.max + config.min) / 2;
      const deviation = (config.max - config.min) / 4;
      const target = mean + ((Math.random() * 2 - 1) * deviation);

      // Move current value toward the target
      const currentValue = currentValues[channel];
      let newValue;

      if (Math.abs(target - currentValue) < config.increment) {
        newValue = target;
      } else if (target > currentValue) {
        newValue = currentValue + config.increment;
      } else {
        newValue = currentValue - config.increment;
      }

      // Ensure within range
      newValue = Math.max(config.min, Math.min(config.max, newValue));

      // Update the stored value
      currentValues[channel] = newValue;

      // Send the update
      broadcastMessage({
        type: 'wits_data',
        data: {
          recordId: Math.floor(Math.random() * 1000) + 1,
          channelId: channel,
          value: newValue,
          timestamp: new Date(),
          mappedName: config.name,
          unit: config.unit
        }
      });

      // Special processing for key channels
      if (channel === 11) { // Gamma
        const gammaData = {
          wellId: 1,
          depth: currentValues[1]?.toString() || '0', // Use bit depth if available
          value: newValue.toString(),
          timestamp: new Date()
        };
        storage.createGammaData(gammaData)
          .then(stored => {
            broadcastGammaDataUpdate(stored);
          })
          .catch(console.error);
      }

      // Create a drilling parameter for each channel
      const param = {
        name: config.name,
        value: newValue.toString(),
        unit: config.unit,
        timestamp: new Date(),
        wellId: 1
      };

      storage.createDrillingParam(param)
        .then(stored => {
          broadcastDrillingParamUpdate(stored);
        })
        .catch(console.error);
    });

    // Periodic survey generation (roughly every 5 minutes in real time, but every 30 seconds in simulation)
    if (Math.random() < 0.01) { // ~1% chance each interval
      const incValue = currentValues[10] || 45; // Use MWD inclination if available
      const aziValue = currentValues[12] || 180; // Use MWD azimuth if available
      const mdValue = currentValues[1] || 10000; // Use bit depth if available

      const surveyData = {
        wellId: 1,
        md: mdValue.toFixed(2),
        inc: incValue.toFixed(2),
        azi: aziValue.toFixed(2),
        bitDepth: mdValue.toFixed(2),
        timestamp: new Date()
      };

      storage.createSurvey(surveyData)
        .then(survey => {
          broadcastSurveyUpdate('created', survey);
          // Disabled automatic modal popup as per user request
          // broadcastMessage({
          //   type: 'show_survey_modal',
          //   data: survey
          // });
        })
        .catch(console.error);
    }

    // Update status timestamp
    broadcastMessage({
      type: 'wits_status',
      data: {
        connected: true,
        address: 'simulated-server:8080',
        lastData: new Date()
      }
    });
  }, 2000); // Update every 2 seconds
}