
export enum AppStep {
  Intro,
  Questionnaire,
  ImageUpload,
  Generating,
  Complete,
  Error,
}

export interface UserImage {
  id: string;
  dataUrl: string;
  mimeType: string;
}
