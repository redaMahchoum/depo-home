# Image Format Guide for Agent Store

This guide explains how to prepare and format images for storage in the Agent Store database.

## Supported Image Formats

The system supports the following image formats:
- **JPEG** (`.jpg`, `.jpeg`) - `image/jpeg`
- **PNG** (`.png`) - `image/png`
- **GIF** (`.gif`) - `image/gif`
- **WebP** (`.webp`) - `image/webp`
- **BMP** (`.bmp`) - `image/bmp`
- **SVG** (`.svg`) - `image/svg+xml`

## Image Preparation Requirements

### Size Limitations
- **Maximum file size**: 16MB (as base64 encoded)
- **Recommended size**: Under 2MB for optimal performance
- **Recommended dimensions**: 512x512 pixels or smaller for agent avatars

### Quality Guidelines
- Use **PNG** for images with transparency or sharp edges
- Use **JPEG** for photographs or complex images
- Use **WebP** for modern browsers (best compression)
- Avoid **BMP** for web applications (large file size)

## How to Convert Images to Base64

### Method 1: Using Online Tools
1. Go to an online base64 converter (e.g., base64-image.de)
2. Upload your image
3. Copy the generated base64 string
4. Note the MIME type (e.g., `image/png`)

### Method 2: Using JavaScript in Browser
```javascript
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// Usage:
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
convertImageToBase64(file).then(dataUrl => {
    console.log(dataUrl); // data:image/png;base64,iVBORw0KGgoAAAANS...
});
```

### Method 3: Using Python
```python
import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        base64_string = base64.b64encode(image_file.read()).decode('utf-8')
        return base64_string

# Usage:
base64_data = image_to_base64("my_image.png")
mime_type = "image/png"
data_url = f"data:{mime_type};base64,{base64_data}"
```

### Method 4: Using Command Line (Linux/Mac)
```bash
# Convert image to base64
base64 -i my_image.png

# Create data URL format
echo "data:image/png;base64,$(base64 -i my_image.png)"
```

## API Usage Examples

### Creating an Agent with Image

#### Option 1: Using imageDataUrl (Recommended)
```json
{
    "id": "NEW_AGENT",
    "title": "My New Agent",
    "description": "Description of the agent",
    "imageDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHOLF1ZXwAAAABJRU5ErkJggg==",
    "linkUrl": "https://example.com/agent"
}
```

#### Option 2: Using separate imageData and mimeType
```json
{
    "id": "NEW_AGENT", 
    "title": "My New Agent",
    "description": "Description of the agent",
    "imageData": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHOLF1ZXwAAAABJRU5ErkJggg==",
    "mimeType": "image/png",
    "linkUrl": "https://example.com/agent"
}
```

### Updating an Agent Image
```json
{
    "title": "Updated Agent",
    "description": "Updated description",
    "imageDataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
    "linkUrl": "https://example.com/updated-agent"
}
```

## Frontend Integration

### Getting Image Data
When you fetch agents from the API, the response includes:

```json
{
    "id": "AGENT_ID",
    "title": "Agent Title",
    "description": "Agent description",
    "imageData": "base64_encoded_data",
    "mimeType": "image/png",
    "imageDataUrl": "data:image/png;base64,base64_encoded_data",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
}
```

### Displaying Images in HTML
```html
<!-- Use the imageDataUrl directly -->
<img src="{{agent.imageDataUrl}}" alt="{{agent.title}}" />

<!-- Or construct it manually -->
<img src="data:{{agent.mimeType}};base64,{{agent.imageData}}" alt="{{agent.title}}" />
```

### React Example
```jsx
function AgentCard({ agent }) {
    return (
        <div className="agent-card">
            {agent.imageDataUrl && (
                <img 
                    src={agent.imageDataUrl} 
                    alt={agent.title}
                    style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                />
            )}
            <h3>{agent.title}</h3>
            <p>{agent.description}</p>
        </div>
    );
}
```

## Alternative Image Endpoints

### Get Raw Image Data
```
GET /api/v1/images/agents/{agentId}
```
Returns the image as binary data with appropriate content-type headers.

### Get Data URL
```
GET /api/v1/images/agents/{agentId}/data-url
```
Returns the image as a data URL string.

## Image Optimization Tips

### 1. Compress Images Before Converting
- Use tools like TinyPNG, ImageOptim, or online compressors
- Aim for file sizes under 500KB for agent avatars

### 2. Choose Appropriate Dimensions
- **Agent avatars**: 128x128, 256x256, or 512x512 pixels
- **Banners**: 1200x400 pixels
- **Icons**: 64x64 or 128x128 pixels

### 3. Use Modern Formats
- **WebP**: Best compression for modern browsers
- **AVIF**: Even better compression but limited browser support
- **PNG**: Best for transparency and sharp edges
- **JPEG**: Best for photographs

### 4. Consider Loading Performance
- Large base64 images increase JSON payload size
- Consider lazy loading for lists with many images
- Use placeholder images while loading

## Troubleshooting

### Common Errors

#### "Invalid image data URL format"
- Ensure your data URL starts with `data:`
- Verify it contains `;base64,`
- Check the format: `data:{mimeType};base64,{base64Data}`

#### "Image size too large"
- Maximum size is 16MB as base64
- Compress your image or reduce dimensions
- Consider using JPEG instead of PNG for large images

#### "Unsupported MIME type"
- Check that your MIME type is in the supported list
- Common MIME types: `image/jpeg`, `image/png`, `image/gif`

#### "Invalid base64 data"
- Verify your base64 string is valid
- Ensure there are no extra characters or line breaks
- Test your base64 string with an online decoder

### Performance Considerations

1. **Database Storage**: Base64 increases storage size by ~33%
2. **Network Transfer**: Large images increase API response time
3. **Memory Usage**: Base64 images use more memory when processed
4. **Caching**: Consider implementing caching for frequently accessed images

## Security Notes

- The API validates image format and size to prevent abuse
- Base64 encoding doesn't provide security - it's just encoding
- Consider implementing additional validation on the client side
- Monitor database size growth due to image storage 