import { Enumeration } from "../utils/enum";

export const Availability = Enumeration.builder({
    ONLINE: 'ONLINE',
    OFFLINE: 'OFFLINE',
    BUSY: 'BUSY',
});