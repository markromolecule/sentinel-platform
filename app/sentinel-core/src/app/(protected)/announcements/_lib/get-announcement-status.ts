import { Announcement } from '@sentinel/services';

/**
 * Determines the status of an announcement based on its publication dates.
 *
 * @param announcement The announcement object.
 * @returns The status of the announcement: 'draft', 'published', or 'unpublished'.
 */
export function getAnnouncementStatus(announcement: Announcement): 'draft' | 'published' | 'unpublished' {
    if (announcement.unpublished_at != null) {
        return 'unpublished';
    }
    if (announcement.published_at != null) {
        return 'published';
    }
    return 'draft';
}
