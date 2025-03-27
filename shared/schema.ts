import { pgTable, text, serial, integer, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Well Information Schema
export const wellInfo = pgTable("well_info", {
  id: serial("id").primaryKey(),
  wellName: text("well_name").notNull(),
  rigName: text("rig_name").notNull(),
  sensorOffset: numeric("sensor_offset").notNull(),
  proposedDirection: numeric("proposed_direction"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWellInfoSchema = createInsertSchema(wellInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWellInfo = z.infer<typeof insertWellInfoSchema>;
export type WellInfo = typeof wellInfo.$inferSelect;

// MWD Survey Schema
export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  index: integer("index").notNull(),
  md: numeric("md").notNull(),
  inc: numeric("inc").notNull(),
  azi: numeric("azi").notNull(),
  tvd: numeric("tvd").notNull(),
  northSouth: numeric("north_south").notNull(),
  isNorth: boolean("is_north").notNull(),
  eastWest: numeric("east_west").notNull(),
  isEast: boolean("is_east").notNull(),
  vs: numeric("vs").notNull(),
  dls: numeric("dls").notNull(),
  bitDepth: numeric("bit_depth").notNull(),
  gTotal: numeric("g_total"),
  bTotal: numeric("b_total"),
  dipAngle: numeric("dip_angle"),
  toolFace: numeric("tool_face"),
  wellId: integer("well_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveySchema = createInsertSchema(surveys).omit({
  id: true,
  index: true,
  tvd: true,
  northSouth: true,
  isNorth: true,
  eastWest: true,
  isEast: true,
  vs: true,
  dls: true,
  createdAt: true,
});

export type InsertSurvey = z.infer<typeof insertSurveySchema>;
export type Survey = typeof surveys.$inferSelect;

// Curve Data Schema
export const curveData = pgTable("curve_data", {
  id: serial("id").primaryKey(),
  motorYield: numeric("motor_yield").notNull(),
  dogLegNeeded: numeric("dog_leg_needed").notNull(),
  projectedInc: numeric("projected_inc").notNull(),
  projectedAz: numeric("projected_az").notNull(),
  slideSeen: numeric("slide_seen").notNull(),
  slideAhead: numeric("slide_ahead").notNull(),
  includeInEmail: boolean("include_in_email").default(true).notNull(),
  includeTargetPosition: boolean("include_target_position").default(true).notNull(),
  includeGammaPlot: boolean("include_gamma_plot").default(true).notNull(),
  aboveTarget: numeric("above_target").default('0').notNull(),
  belowTarget: numeric("below_target").default('0').notNull(),
  leftTarget: numeric("left_target").default('0').notNull(),
  rightTarget: numeric("right_target").default('0').notNull(),
  wellId: integer("well_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCurveDataSchema = createInsertSchema(curveData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCurveData = z.infer<typeof insertCurveDataSchema>;
export type CurveData = typeof curveData.$inferSelect;

// Gamma Data Schema
export const gammaData = pgTable("gamma_data", {
  id: serial("id").primaryKey(),
  depth: numeric("depth").notNull(),
  value: numeric("value").notNull(),
  wellId: integer("well_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertGammaDataSchema = createInsertSchema(gammaData).omit({
  id: true,
  timestamp: true,
});

export type InsertGammaData = z.infer<typeof insertGammaDataSchema>;
export type GammaData = typeof gammaData.$inferSelect;

// Email Distribution Schema
export const emailDistributions = pgTable("email_distributions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emails: text("emails").notNull(),
  wellId: integer("well_id").notNull(),
});

export const insertEmailDistributionSchema = createInsertSchema(emailDistributions).omit({
  id: true,
});

export type InsertEmailDistribution = z.infer<typeof insertEmailDistributionSchema>;
export type EmailDistribution = typeof emailDistributions.$inferSelect;

// WITS Mapping Schema
export const witsMapping = pgTable("wits_mapping", {
  id: serial("id").primaryKey(),
  witsId: integer("wits_id").notNull(),
  description: text("description").notNull(),
  mappedTo: text("mapped_to").notNull(),
  wellId: integer("well_id").notNull(),
});

export const insertWitsMappingSchema = createInsertSchema(witsMapping).omit({
  id: true,
});

export type InsertWitsMapping = z.infer<typeof insertWitsMappingSchema>;
export type WitsMapping = typeof witsMapping.$inferSelect;

// Drilling Parameters Schema
export const drillingParams = pgTable("drilling_params", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: numeric("value").notNull(),
  unit: text("unit").notNull(),
  witsId: integer("wits_id"),
  wellId: integer("well_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertDrillingParamSchema = createInsertSchema(drillingParams).omit({
  id: true,
  timestamp: true,
});

export type InsertDrillingParam = z.infer<typeof insertDrillingParamSchema>;
export type DrillingParam = typeof drillingParams.$inferSelect;
