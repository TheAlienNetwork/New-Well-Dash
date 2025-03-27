import express, { type Express, Request, Response } from "express";
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

// Interval-based data simulator for demo purposes
let witsSimulationInterval: NodeJS.Timeout | null = null;
const activeConnections = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for WITS data
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

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
          // Handle WITS configuration
          // This would be used to configure the WITS server connection in a real app
          ws.send(JSON.stringify({
            type: 'wits_config_response',
            status: 'success',
            message: 'WITS configuration received'
          }));
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
      const validatedData = insertWellInfoSchema.partial().parse(req.body);

      const updated = await storage.updateWellInfo(wellId, validatedData);

      if (!updated) {
        return res.status(404).json({ error: 'Well not found' });
      }

      res.json(updated);

      // Broadcast update to all connected clients
      broadcastWellInfoUpdate(updated);
    } catch (error) {
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
      const validatedData = insertSurveySchema.parse(req.body);
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
      const validatedData = insertSurveySchema.partial().parse(req.body);

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
        address: '192.168.1.105:8080'
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
  //Removed simulated data
}