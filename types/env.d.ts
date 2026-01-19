declare module "axiom" {
  export class AxiomRequest {
    constructor(config: { token: string; dataset: string });
    ingest(data: any): Promise<void>;
  }
}
