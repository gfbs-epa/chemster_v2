// User authentication credentials
export type Credentials = { 
  username: string, 
  password: string 
}

// User authentication tokens
export type Tokens = { 
  access_token: string, 
  refresh_token: string 
}

// A workspace, set, or slice of chemicals
// Corresponds to SQLite database table collections
export type Collection = { 
  id: number, 
  name: string, 
  super_id: number, 
  owner_id: number 
}

// A chemical identifier
// Corresponds to SQLite database table chemicals
export type Chemical = {
  dtxsid: string
}

// A property record pulled from CTX APIs
export type CTXProperty = {
  name: string,
  propertyId: string,
  propType: string
}

// A chemicals record pulled from CTX APIs
// using the NTA Toolkit projection
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

// A list record pulled from CTX APIs
export type CTXList = {
  id: number,
  listName: string,
  shortDescription: string,
  longDescription: string,
  type: string,
  visibility: string,
  createdAt: string,
  chemicalCount: number,
  updatedAt: string,
  label: string
}

// A trimmed list record from CTX APIs for use in selectors
export type CTXListDisplay = {
  title: string,
  value: string,
  props: { subtitle: string }
}

export type PropertyData = {
  columns: string[],
  data: number[][],
  index: string[]
}