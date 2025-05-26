export interface AgentDto {
  id: string;
  title: string; // maxLength: 100, minLength: 3
  description: string;
  // Base64 encoded image data for storage
  imageData?: string;
  // MIME type of the image (e.g., "image/jpeg", "image/png")
  mimeType?: string;
  // Complete data URL for frontend display (format: "data:{mimeType};base64,{imageData}")
  imageDataUrl?: string;
  linkUrl?: string; // Optional based on schema presence, adjust if required
  port?: string; // Port number where the agent application is running
  createdAt?: string; // format: date-time
  updatedAt?: string; // format: date-time
} 