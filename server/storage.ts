import { 
  users, type User, type InsertUser,
  wellInfo, type WellInfo, type InsertWellInfo,
  surveys, type Survey, type InsertSurvey,
  curveData, type CurveData, type InsertCurveData,
  gammaData, type GammaData, type InsertGammaData,
  emailDistributions, type EmailDistribution, type InsertEmailDistribution,
  witsMapping, type WitsMapping, type InsertWitsMapping,
  drillingParams, type DrillingParam, type InsertDrillingParam
} from "@shared/schema";

export interface IStorage {
  // User Methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Well Info Methods
  getWellInfo(id: number): Promise<WellInfo | undefined>;
  getAllWellInfo(): Promise<WellInfo[]>;
  createWellInfo(wellInfo: InsertWellInfo): Promise<WellInfo>;
  updateWellInfo(id: number, wellInfo: Partial<InsertWellInfo>): Promise<WellInfo | undefined>;
  
  // Survey Methods
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveysByWellId(wellId: number): Promise<Survey[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined>;
  deleteSurvey(id: number): Promise<boolean>;
  
  // Curve Data Methods
  getCurveDataByWellId(wellId: number): Promise<CurveData | undefined>;
  createCurveData(curveData: InsertCurveData): Promise<CurveData>;
  updateCurveData(id: number, curveData: Partial<InsertCurveData>): Promise<CurveData | undefined>;
  
  // Gamma Data Methods
  getGammaDataByWellId(wellId: number): Promise<GammaData[]>;
  createGammaData(gammaData: InsertGammaData): Promise<GammaData>;
  
  // Email Distribution Methods
  getEmailDistributionsByWellId(wellId: number): Promise<EmailDistribution[]>;
  createEmailDistribution(distribution: InsertEmailDistribution): Promise<EmailDistribution>;
  updateEmailDistribution(id: number, distribution: Partial<InsertEmailDistribution>): Promise<EmailDistribution | undefined>;
  deleteEmailDistribution(id: number): Promise<boolean>;
  
  // WITS Mapping Methods
  getWitsMappingsByWellId(wellId: number): Promise<WitsMapping[]>;
  createWitsMapping(mapping: InsertWitsMapping): Promise<WitsMapping>;
  updateWitsMapping(id: number, mapping: Partial<InsertWitsMapping>): Promise<WitsMapping | undefined>;
  deleteWitsMapping(id: number): Promise<boolean>;
  
  // Drilling Parameters Methods
  getDrillingParamsByWellId(wellId: number): Promise<DrillingParam[]>;
  createDrillingParam(param: InsertDrillingParam): Promise<DrillingParam>;
  updateDrillingParam(id: number, param: Partial<InsertDrillingParam>): Promise<DrillingParam | undefined>;
  deleteDrillingParam(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wellInfos: Map<number, WellInfo>;
  private surveys: Map<number, Survey>;
  private curveDatas: Map<number, CurveData>;
  private gammaDatas: Map<number, GammaData>;
  private emailDistributions: Map<number, EmailDistribution>;
  private witsMappings: Map<number, WitsMapping>;
  private drillingParams: Map<number, DrillingParam>;
  
  private currentUserId: number;
  private currentWellInfoId: number;
  private currentSurveyId: number;
  private currentCurveDataId: number;
  private currentGammaDataId: number;
  private currentEmailDistributionId: number;
  private currentWitsMappingId: number;
  private currentDrillingParamId: number;

  constructor() {
    this.users = new Map();
    this.wellInfos = new Map();
    this.surveys = new Map();
    this.curveDatas = new Map();
    this.gammaDatas = new Map();
    this.emailDistributions = new Map();
    this.witsMappings = new Map();
    this.drillingParams = new Map();
    
    this.currentUserId = 1;
    this.currentWellInfoId = 1;
    this.currentSurveyId = 1;
    this.currentCurveDataId = 1;
    this.currentGammaDataId = 1;
    this.currentEmailDistributionId = 1;
    this.currentWitsMappingId = 1;
    this.currentDrillingParamId = 1;
    
    // Start without sample data
  }
  
  private initializeDemo() {
    // Add demo well info
    const demoWellInfo: InsertWellInfo = {
      wellName: "DEEP HORIZON #42",
      rigName: "PLATFORM ALPHA",
      sensorOffset: "100",
      proposedDirection: "175"
    };
    this.createWellInfo(demoWellInfo);
    
    // Add demo curve data
    const demoCurveData: InsertCurveData = {
      motorYield: "2.76",
      dogLegNeeded: "1.54",
      projectedInc: "6.23",
      projectedAz: "178.65",
      slideSeen: "38.2",
      slideAhead: "42.5",
      includeInEmail: true,
      wellId: 1
    };
    this.createCurveData(demoCurveData);
    
    // Add demo surveys
    const demoSurveys: InsertSurvey[] = [
      {
        md: "1250.45",
        inc: "1.25",
        azi: "175.82",
        tvd: "1250.40",
        northSouth: "3.82",
        isNorth: false,
        eastWest: "0.42",
        isEast: true,
        vs: "3.78",
        dls: "0.15",
        bitDepth: "1350.45",
        gTotal: "0.999",
        bTotal: "1.002",
        dipAngle: "67.52",
        toolFace: "264.2",
        wellId: 1
      },
      {
        md: "1350.78",
        inc: "2.18",
        azi: "176.13",
        tvd: "1350.67",
        northSouth: "6.58",
        isNorth: false,
        eastWest: "0.67",
        isEast: true,
        vs: "6.53",
        dls: "0.93",
        bitDepth: "1450.78",
        gTotal: "0.999",
        bTotal: "1.002",
        dipAngle: "67.52",
        toolFace: "264.2",
        wellId: 1
      },
      {
        md: "1459.92",
        inc: "3.85",
        azi: "177.42",
        tvd: "1459.69",
        northSouth: "12.45",
        isNorth: false,
        eastWest: "0.89",
        isEast: true,
        vs: "12.38",
        dls: "1.54",
        bitDepth: "1559.92",
        gTotal: "0.999",
        bTotal: "1.002",
        dipAngle: "67.52",
        toolFace: "264.2",
        wellId: 1
      }
    ];
    
    demoSurveys.forEach((survey, index) => {
      const surveyWithIndex = { ...survey, index: index + 1 };
      this.createSurvey(surveyWithIndex);
    });
    
    // Add demo gamma data
    const depths = ["1450", "1451", "1452", "1453", "1454", "1455", "1456", "1457", "1458", "1459", "1460"];
    const values = ["60", "62", "64", "68", "72", "74", "72", "68", "65", "63", "62"];
    
    depths.forEach((depth, index) => {
      this.createGammaData({
        depth,
        value: values[index],
        wellId: 1
      });
    });
    
    // Add demo WITS mappings
    const demoWitsMappings: InsertWitsMapping[] = [
      { witsId: 1, description: "Bit Depth", mappedTo: "bitDepth", wellId: 1 },
      { witsId: 2, description: "Inclination", mappedTo: "inc", wellId: 1 },
      { witsId: 3, description: "Azimuth", mappedTo: "azi", wellId: 1 },
      { witsId: 4, description: "Gamma Ray", mappedTo: "gamma", wellId: 1 },
      { witsId: 5, description: "ROP", mappedTo: "rop", wellId: 1 }
    ];
    
    demoWitsMappings.forEach(mapping => {
      this.createWitsMapping(mapping);
    });
    
    // Add demo drilling parameters
    const demoDrillingParams: InsertDrillingParam[] = [
      { name: "Weight on Bit", value: "25.4", unit: "klbs", witsId: 10, wellId: 1 },
      { name: "RPM", value: "120", unit: "rpm", witsId: 11, wellId: 1 },
      { name: "Flow Rate", value: "650", unit: "gpm", witsId: 12, wellId: 1 },
      { name: "Standpipe Pressure", value: "2750", unit: "psi", witsId: 13, wellId: 1 },
      { name: "Torque", value: "8500", unit: "ft-lbs", witsId: 14, wellId: 1 },
      { name: "ROP", value: "54.2", unit: "ft/hr", witsId: 5, wellId: 1 }
    ];
    
    demoDrillingParams.forEach(param => {
      this.createDrillingParam(param);
    });
    
    // Add demo email distribution
    this.createEmailDistribution({
      name: "Operations Team",
      emails: "ops@example.com, manager@example.com, driller@example.com",
      wellId: 1
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Well Info Methods
  async getWellInfo(id: number): Promise<WellInfo | undefined> {
    return this.wellInfos.get(id);
  }
  
  async getAllWellInfo(): Promise<WellInfo[]> {
    return Array.from(this.wellInfos.values());
  }
  
  async createWellInfo(info: InsertWellInfo): Promise<WellInfo> {
    const id = this.currentWellInfoId++;
    const now = new Date();
    
    // Ensure numeric values are properly handled as strings
    const processedInfo: InsertWellInfo = {
      ...info,
      sensorOffset: String(info.sensorOffset || '0'),
      proposedDirection: info.proposedDirection ? String(info.proposedDirection) : null
    };
    
    console.log('Creating well info with processed data:', processedInfo);
    
    const wellInfo: WellInfo = { 
      ...processedInfo, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    
    console.log('Created well info:', wellInfo);
    
    this.wellInfos.set(id, wellInfo);
    return wellInfo;
  }
  
  async updateWellInfo(id: number, info: Partial<InsertWellInfo>): Promise<WellInfo | undefined> {
    const existing = this.wellInfos.get(id);
    if (!existing) return undefined;
    
    // Ensure numeric values are properly handled
    const processedInfo: Partial<InsertWellInfo> = {
      ...info
    };
    
    // Explicitly handle all string type numeric fields to ensure consistency
    if (processedInfo.sensorOffset !== undefined) {
      processedInfo.sensorOffset = String(processedInfo.sensorOffset);
    }
    
    if (processedInfo.proposedDirection !== undefined) {
      processedInfo.proposedDirection = String(processedInfo.proposedDirection);
    }
    
    console.log('Updating well info with processed data:', processedInfo);
    
    const updated: WellInfo = {
      ...existing,
      ...processedInfo,
      // Explicitly set proposedDirection as it can be undefined in processedInfo
      proposedDirection: processedInfo.proposedDirection !== undefined 
        ? processedInfo.proposedDirection 
        : existing.proposedDirection,
      updatedAt: new Date()
    };
    
    console.log('Updated well info:', updated);
    
    this.wellInfos.set(id, updated);
    return updated;
  }
  
  // Survey Methods
  async getSurvey(id: number): Promise<Survey | undefined> {
    return this.surveys.get(id);
  }
  
  async getSurveysByWellId(wellId: number): Promise<Survey[]> {
    return Array.from(this.surveys.values())
      .filter(survey => survey.wellId === wellId)
      .sort((a, b) => a.index - b.index);
  }
  
  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const id = this.currentSurveyId++;
    const now = new Date();
    
    // Get the current highest index for this well
    const existingSurveys = await this.getSurveysByWellId(survey.wellId);
    const index = existingSurveys.length > 0 
      ? Math.max(...existingSurveys.map(s => s.index)) + 1 
      : 1;
      
    const newSurvey: Survey = {
      ...survey,
      id,
      index,
      createdAt: now
    };
    
    this.surveys.set(id, newSurvey);
    return newSurvey;
  }
  
  async updateSurvey(id: number, survey: Partial<InsertSurvey>): Promise<Survey | undefined> {
    const existing = this.surveys.get(id);
    if (!existing) return undefined;
    
    const updated: Survey = {
      ...existing,
      ...survey
    };
    
    this.surveys.set(id, updated);
    return updated;
  }
  
  async deleteSurvey(id: number): Promise<boolean> {
    const deleted = this.surveys.delete(id);
    
    if (deleted) {
      // Reindex the remaining surveys for the well
      const survey = this.surveys.get(id);
      if (survey) {
        const wellSurveys = await this.getSurveysByWellId(survey.wellId);
        wellSurveys.forEach((s, idx) => {
          s.index = idx + 1;
          this.surveys.set(s.id, s);
        });
      }
    }
    
    return deleted;
  }
  
  // Curve Data Methods
  async getCurveDataByWellId(wellId: number): Promise<CurveData | undefined> {
    return Array.from(this.curveDatas.values())
      .find(curve => curve.wellId === wellId);
  }
  
  async createCurveData(data: InsertCurveData): Promise<CurveData> {
    const id = this.currentCurveDataId++;
    const now = new Date();
    
    // Check if there's existing curve data for this well
    const existing = await this.getCurveDataByWellId(data.wellId);
    
    // If exists, update it instead of creating new
    if (existing) {
      const updated: CurveData = {
        ...existing,
        ...data,
        updatedAt: now
      };
      
      this.curveDatas.set(existing.id, updated);
      return updated;
    }
    
    // Otherwise create new
    const curveData: CurveData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.curveDatas.set(id, curveData);
    return curveData;
  }
  
  async updateCurveData(id: number, data: Partial<InsertCurveData>): Promise<CurveData | undefined> {
    const existing = this.curveDatas.get(id);
    if (!existing) return undefined;
    
    const updated: CurveData = {
      ...existing,
      ...data,
      updatedAt: new Date()
    };
    
    this.curveDatas.set(id, updated);
    return updated;
  }
  
  // Gamma Data Methods
  async getGammaDataByWellId(wellId: number): Promise<GammaData[]> {
    return Array.from(this.gammaDatas.values())
      .filter(data => data.wellId === wellId)
      .sort((a, b) => Number(a.depth) - Number(b.depth));
  }
  
  async createGammaData(data: InsertGammaData): Promise<GammaData> {
    const id = this.currentGammaDataId++;
    const now = new Date();
    
    const gammaData: GammaData = {
      ...data,
      id,
      timestamp: now
    };
    
    this.gammaDatas.set(id, gammaData);
    return gammaData;
  }
  
  // Email Distribution Methods
  async getEmailDistributionsByWellId(wellId: number): Promise<EmailDistribution[]> {
    return Array.from(this.emailDistributions.values())
      .filter(dist => dist.wellId === wellId);
  }
  
  async createEmailDistribution(distribution: InsertEmailDistribution): Promise<EmailDistribution> {
    const id = this.currentEmailDistributionId++;
    
    const emailDist: EmailDistribution = {
      ...distribution,
      id
    };
    
    this.emailDistributions.set(id, emailDist);
    return emailDist;
  }
  
  async updateEmailDistribution(id: number, distribution: Partial<InsertEmailDistribution>): Promise<EmailDistribution | undefined> {
    const existing = this.emailDistributions.get(id);
    if (!existing) return undefined;
    
    const updated: EmailDistribution = {
      ...existing,
      ...distribution
    };
    
    this.emailDistributions.set(id, updated);
    return updated;
  }
  
  async deleteEmailDistribution(id: number): Promise<boolean> {
    return this.emailDistributions.delete(id);
  }
  
  // WITS Mapping Methods
  async getWitsMappingsByWellId(wellId: number): Promise<WitsMapping[]> {
    return Array.from(this.witsMappings.values())
      .filter(mapping => mapping.wellId === wellId);
  }
  
  async createWitsMapping(mapping: InsertWitsMapping): Promise<WitsMapping> {
    const id = this.currentWitsMappingId++;
    
    const witsMapping: WitsMapping = {
      ...mapping,
      id
    };
    
    this.witsMappings.set(id, witsMapping);
    return witsMapping;
  }
  
  async updateWitsMapping(id: number, mapping: Partial<InsertWitsMapping>): Promise<WitsMapping | undefined> {
    const existing = this.witsMappings.get(id);
    if (!existing) return undefined;
    
    const updated: WitsMapping = {
      ...existing,
      ...mapping
    };
    
    this.witsMappings.set(id, updated);
    return updated;
  }
  
  async deleteWitsMapping(id: number): Promise<boolean> {
    return this.witsMappings.delete(id);
  }
  
  // Drilling Parameters Methods
  async getDrillingParamsByWellId(wellId: number): Promise<DrillingParam[]> {
    return Array.from(this.drillingParams.values())
      .filter(param => param.wellId === wellId);
  }
  
  async createDrillingParam(param: InsertDrillingParam): Promise<DrillingParam> {
    const id = this.currentDrillingParamId++;
    const now = new Date();
    
    const drillingParam: DrillingParam = {
      ...param,
      id,
      timestamp: now
    };
    
    this.drillingParams.set(id, drillingParam);
    return drillingParam;
  }
  
  async updateDrillingParam(id: number, param: Partial<InsertDrillingParam>): Promise<DrillingParam | undefined> {
    const existing = this.drillingParams.get(id);
    if (!existing) return undefined;
    
    const updated: DrillingParam = {
      ...existing,
      ...param,
      timestamp: new Date()
    };
    
    this.drillingParams.set(id, updated);
    return updated;
  }
  
  async deleteDrillingParam(id: number): Promise<boolean> {
    return this.drillingParams.delete(id);
  }
}

export const storage = new MemStorage();
