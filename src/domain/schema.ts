import { z } from 'zod'
import type {
  Action,
  ActionInput,
  ActionStatus,
  ActionWindow,
  ArtKey,
  AvatarId,
  CityState,
  EventCompletion,
  Experience,
  Insight,
  InsightInput,
  Journal,
  JournalInput,
  JournalType,
  OnboardingInput,
  Period,
  Profile,
  Progress,
  SaveV2,
  Settings,
  ChapterSummary,
} from './types'

const timestamp = z.iso.datetime()
const artKey = z.enum([
  'avatar-chenguang',
  'avatar-yese',
  'avatar-qingtai',
  'avatar-taotu',
  'night-room',
  'plaza',
  'sketch-plaza',
  'sketch-oldman',
  'sketch-bridge',
  'sketch-mugs',
  'sketch-desk',
  'sketch-park',
  'sketch-ruins',
  'sketch-plane',
  'sketch-map',
])
const avatarId = z.enum(['chenguang', 'yese', 'qingtai', 'taotu'])
const period = z.enum(['早上', '下午', '傍晚', '夜里'])
const actionStatus = z.enum(['todo', 'doing', 'paused', 'done'])
const actionWindow = z.enum(['today-week', 'today', 'week', 'someday'])
const journalType = z.enum(['free', 'action', 'insight'])
const insightStatus = z.enum(['guess', 'confirmed', 'rejected', 'rewritten'])

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(8),
  avatarId,
  lifeStages: z.array(z.string().trim().min(1).max(20)).max(4),
  topics: z.array(z.string().trim().min(1).max(20)).max(5),
  createdAt: timestamp.nullable(),
}) satisfies z.ZodType<Profile>

export const progressSchema = z.object({
  day: z.number().int().min(1).max(999),
  period,
  energy: z.number().int().min(0).max(100),
  prologueStep: z.number().int().min(0).max(5),
  exploredSceneIds: z.array(z.string().min(1).max(40)).max(20),
  chapter: z.number().int().min(1).max(2).default(1),
  chapter2UnlockedAt: timestamp.nullable().default(null),
}) satisfies z.ZodType<Progress>

export const settingsSchema = z.object({
  defaultExperienceConsent: z.boolean(),
  invitationsEnabled: z.boolean(),
  thresholdExperiences: z.literal(3),
  thresholdCategories: z.literal(2),
}) satisfies z.ZodType<Settings>

export const citySchema = z.object({
  inviteDismissedAt: timestamp.nullable(),
  lumiMetAt: timestamp.nullable(),
  playedScriptIds: z.array(z.string().min(1).max(60)).max(80).default([]),
}) satisfies z.ZodType<CityState>

export const experienceSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1).max(60),
  sceneId: z.string().min(1).max(60),
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
  kind: z.enum(['event', 'scene']),
  occurredAt: timestamp,
  consent: z.boolean(),
  consentUpdatedAt: timestamp,
  deletedAt: timestamp.nullable(),
  artKey,
}) satisfies z.ZodType<Experience>

export const insightSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1).max(40),
  text: z.string().min(1).max(300),
  sourceExperienceIds: z.array(z.string().min(1)).max(20),
  status: insightStatus,
  rewrittenText: z.string().trim().min(1).max(300).nullable(),
  updatedAt: timestamp,
}) satisfies z.ZodType<Insight>

export const actionSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(40),
  sourceInsightId: z.string().min(1).nullable(),
  sourceLabel: z.string().trim().min(1).max(40),
  status: actionStatus,
  when: actionWindow,
  doneAt: timestamp.nullable(),
  artKey,
  createdAt: timestamp,
  updatedAt: timestamp,
  autoReviewJournalId: z.string().min(1).nullable(),
}) satisfies z.ZodType<Action>

export const journalSchema = z.object({
  id: z.string().min(1),
  type: journalType,
  text: z.string().trim().min(1).max(2000),
  period,
  createdAt: timestamp,
  updatedAt: timestamp,
  actionId: z.string().min(1).nullable(),
  insightId: z.string().min(1).nullable(),
  sceneId: z.string().min(1).nullable(),
  linkLabel: z.string().trim().min(1).max(60).nullable(),
  artKey,
}) satisfies z.ZodType<Journal>

export const eventCompletionSchema = z.object({
  choiceId: z.string().min(1).max(60),
  experienceId: z.string().min(1),
  reason: z.string().trim().max(200),
  completedAt: timestamp,
}) satisfies z.ZodType<EventCompletion>

export const summarySchema = z.object({
  title: z.string().trim().min(1).max(60),
  text: z.string().trim().min(1).max(1200),
  updatedAt: timestamp,
}) satisfies z.ZodType<ChapterSummary>

export const saveSchema = z.object({
  schemaVersion: z.literal(2),
  profile: profileSchema,
  progress: progressSchema,
  settings: settingsSchema,
  city: citySchema,
  experiences: z.array(experienceSchema).max(500),
  insights: z.array(insightSchema).max(100),
  actions: z.array(actionSchema).max(500),
  journals: z.array(journalSchema).max(1000),
  events: z.record(z.string().min(1), eventCompletionSchema),
  summary: summarySchema.nullable(),
  pastSummaries: z.array(summarySchema).max(20).default([]),
}).strict() satisfies z.ZodType<SaveV2>

export const onboardingSchema = z.object({
  name: z.string().trim().max(8, '昵称最多 8 个字。'),
  avatarId,
  lifeStages: z.array(z.string().trim().min(1, '状态不能是空的。').max(20, '每个状态最多 20 个字。')).max(4, '最多选 4 个状态。'),
  topics: z.array(z.string().trim().min(1, '主题不能是空的。').max(20, '每个主题最多 20 个字。')).max(5, '最多选 5 个主题。'),
}) satisfies z.ZodType<OnboardingInput>

export const actionInputSchema = z.object({
  title: z.string().trim().min(1, '给这件小事一个名字。').max(40, '标题请控制在 40 字以内。'),
  sourceInsightId: z.string().min(1).nullable().optional(),
  sourceLabel: z.string().trim().min(1).max(40),
  when: actionWindow,
  artKey,
}) satisfies z.ZodType<ActionInput>

export const journalInputSchema = z.object({
  type: journalType,
  text: z.string().trim().min(1, '先写一个字吧。').max(2000, '正文请控制在 2000 字以内。'),
  period,
  actionId: z.string().min(1).nullable().optional(),
  insightId: z.string().min(1).nullable().optional(),
  sceneId: z.string().min(1).nullable().optional(),
  linkLabel: z.string().trim().max(60).nullable().optional(),
  artKey,
}) satisfies z.ZodType<JournalInput>

export const insightInputSchema = z.object({
  key: z.string().trim().min(1).max(40),
  text: z.string().trim().min(1).max(300),
  sourceExperienceIds: z.array(z.string().min(1)).max(20),
}) satisfies z.ZodType<InsightInput>

export const eventInputSchema = z.object({
  eventId: z.string().min(1).max(60),
  sceneId: z.string().min(1).max(60),
  choiceId: z.string().min(1).max(60),
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(2000),
  reason: z.string().trim().max(200),
  consent: z.boolean(),
  artKey,
})

export type { ActionStatus, ActionWindow, ArtKey, AvatarId, JournalType, Period }
