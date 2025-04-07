import { NamesAndTypesQueryResult } from "rclnodejs";

export type NODES_DETAILS_TYPE = {
  [node: string]: {
    publishers: NamesAndTypesQueryResult[];
    subscribers: NamesAndTypesQueryResult[];
    services: NamesAndTypesQueryResult[];
    clients: any;
    svc: any;
  }
}