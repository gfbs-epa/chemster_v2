export type Credentials = { 
  username: string, 
  password: string 
}

export type Tokens = { 
  access_token: string, 
  refresh_token: string 
}

export type Collection = { 
  id: number, 
  name: string, 
  super_id: number, 
  owner_id: number 
}

export type APIChemical = {
  dtxsid: string
}

export type CTXChemical = {
  dtxsid: string,
  dtxcid: string,
  preferredName: string,
  casrn: string,
  monoisotopicMass: number,
  molFormula: string,
  inchikey: string,
  smiles: string,
  msReadySmiles: string
  cpdataCount: number,
  activeAssays: number,
  percentAssays: number,
  expocatMedianPrediction: string,
  expocat: string,
  nhanes: string,
  sourcesCount: number,
  totalAssays: number,
}