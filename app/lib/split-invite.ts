/**
 * Where a web invite lands after the join succeeds.
 *
 * The Splits page opens on Balances, which for someone who joined a group a
 * second ago reads "No balances yet" — the join looks like it did nothing. The
 * group id rides along in the query so the page can name the group in a
 * confirmation and scroll to Groups, then drop the param so a refresh does not
 * announce the same join twice.
 */
export const JOINED_GROUP_PARAM = "joined";

const SPLITS_PATH = "/dashboard/splits";

export function joinedGroupPath(groupID: number | null | undefined): string {
    if (!isGroupID(groupID)) return `${SPLITS_PATH}#groups`;
    return `${SPLITS_PATH}?${JOINED_GROUP_PARAM}=${groupID}#groups`;
}

/** Reads the joined group id from a `location.search` string; anything malformed is no join. */
export function readJoinedGroupID(search: string): number | null {
    const raw = new URLSearchParams(search).get(JOINED_GROUP_PARAM);
    if (!raw || !/^\d+$/.test(raw)) return null;
    const id = Number(raw);
    return isGroupID(id) ? id : null;
}

/** The search string with the joined param removed, keeping any others. Empty, or starting with `?`. */
export function withoutJoinedGroup(search: string): string {
    const params = new URLSearchParams(search);
    params.delete(JOINED_GROUP_PARAM);
    const rest = params.toString();
    return rest ? `?${rest}` : "";
}

function isGroupID(value: number | null | undefined): value is number {
    return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
