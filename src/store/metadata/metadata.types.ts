import { Language } from "../../i18initializer"

export type MetadataStoreState = {
  currentLanguage: Language
}

export type ChangeCurrentLanguagePayload = {
  language: Language
}
