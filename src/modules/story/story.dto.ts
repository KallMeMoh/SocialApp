import z from 'zod';
import { sharedFields, storyFields } from '../../common/validation/fields.js';

export const createStorySchema = z.object({
  body: z.object({
    mimeType: storyFields.type.optional(),
    text: storyFields.text,
  }),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({}),
});

export const followedUsersStoriesSchema = z.object({
  body: z.object({}),

  query: z.object({ ln: sharedFields.ln, page: z.number() }),

  params: z.object({}),
});

export const deleteStorySchema = z.object({
  body: z.object({}),

  query: z.object({ ln: sharedFields.ln }),

  params: z.object({ storyId: sharedFields.id }),
});

export type CreateStoryDTO = z.infer<typeof createStorySchema>;
export type FollowedUsersStoriesDTO = z.infer<
  typeof followedUsersStoriesSchema
>;
export type DeleteStoryDTO = z.infer<typeof deleteStorySchema>;
