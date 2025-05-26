package com.agentstore.api.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;

import java.util.Base64;
import java.util.Set;

@Slf4j
public class ImageUtil {
    
    // Supported image MIME types
    private static final Set<String> SUPPORTED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp",
            "image/svg+xml"
    );
    
    // Maximum image size in bytes (16MB as base64)
    private static final long MAX_IMAGE_SIZE_BYTES = 16 * 1024 * 1024;
    
    /**
     * Validates a base64 encoded image
     * @param base64Data The base64 encoded image data
     * @param mimeType The MIME type of the image
     * @return true if valid, false otherwise
     */
    public static boolean isValidImage(String base64Data, String mimeType) {
        if (!StringUtils.hasText(base64Data) || !StringUtils.hasText(mimeType)) {
            return false;
        }
        
        // Check MIME type
        if (!SUPPORTED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            log.warn("Unsupported MIME type: {}", mimeType);
            return false;
        }
        
        // Check size
        if (base64Data.length() > MAX_IMAGE_SIZE_BYTES) {
            log.warn("Image size too large: {} bytes", base64Data.length());
            return false;
        }
        
        // Validate base64 format
        try {
            Base64.getDecoder().decode(base64Data);
            return true;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid base64 data", e);
            return false;
        }
    }
    
    /**
     * Extracts MIME type and base64 data from a data URL
     * @param dataUrl The data URL in format "data:{mimeType};base64,{base64Data}"
     * @return Array with [mimeType, base64Data] or null if invalid
     */
    public static String[] parseDataUrl(String dataUrl) {
        if (!StringUtils.hasText(dataUrl) || !dataUrl.startsWith("data:") || !dataUrl.contains(";base64,")) {
            return null;
        }
        
        try {
            String[] parts = dataUrl.split(";base64,");
            if (parts.length != 2) {
                return null;
            }
            
            String mimeType = parts[0].substring(5); // Remove "data:" prefix
            String base64Data = parts[1];
            
            if (isValidImage(base64Data, mimeType)) {
                return new String[]{mimeType, base64Data};
            }
            
            return null;
        } catch (Exception e) {
            log.error("Error parsing data URL", e);
            return null;
        }
    }
    
    /**
     * Creates a data URL from MIME type and base64 data
     * @param mimeType The MIME type
     * @param base64Data The base64 encoded data
     * @return The data URL or null if invalid
     */
    public static String createDataUrl(String mimeType, String base64Data) {
        if (isValidImage(base64Data, mimeType)) {
            return String.format("data:%s;base64,%s", mimeType, base64Data);
        }
        return null;
    }
    
    /**
     * Gets the file extension for a MIME type
     * @param mimeType The MIME type
     * @return The file extension (without dot) or "bin" for unknown types
     */
    public static String getFileExtensionForMimeType(String mimeType) {
        if (!StringUtils.hasText(mimeType)) {
            return "bin";
        }
        
        return switch (mimeType.toLowerCase()) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            case "image/bmp" -> "bmp";
            case "image/svg+xml" -> "svg";
            default -> "bin";
        };
    }
    
    /**
     * Gets the estimated file size in bytes from base64 data
     * @param base64Data The base64 encoded data
     * @return Estimated file size in bytes
     */
    public static long getEstimatedFileSize(String base64Data) {
        if (!StringUtils.hasText(base64Data)) {
            return 0;
        }
        
        // Base64 encoding increases size by approximately 33%
        // Each 4 characters in base64 represent 3 bytes of original data
        return (long) (base64Data.length() * 0.75);
    }
    
    /**
     * Formats file size in human-readable format
     * @param bytes Size in bytes
     * @return Formatted size string
     */
    public static String formatFileSize(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String[] units = {"B", "KB", "MB", "GB"};
        
        if (exp >= units.length) {
            exp = units.length - 1;
        }
        
        double value = bytes / Math.pow(1024, exp);
        return String.format("%.1f %s", value, units[exp]);
    }
} 