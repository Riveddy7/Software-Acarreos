export interface PhotoOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface PhotoResult {
  originalFile: File;
  compressedFile: File;
  originalUrl: string;
  compressedUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class PhotoCapture {
  private readonly DEFAULT_OPTIONS: PhotoOptions = {
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    format: 'jpeg'
  };

  /**
   * Capture photo from camera
   */
  async captureFromCamera(options?: PhotoOptions): Promise<PhotoResult> {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject(new Error('Camera not available on this device'));
        return;
      }

      // Create video element for camera preview
      const video = document.createElement('video');
      video.autoplay = true;
      video.style.display = 'none';
      document.body.appendChild(video);

      // Create canvas for image capture
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Get camera stream
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      .then(stream => {
        video.srcObject = stream;
        
        // Wait for video to load
        video.onloadedmetadata = () => {
          // Set canvas dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert to blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to capture image'));
                return;
              }

              // Clean up
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(video);

              // Create file from blob
              const originalFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
              
              try {
                // Compress image
                const compressedResult = await this.compressImage(originalFile, finalOptions);
                resolve(compressedResult);
              } catch (error) {
                reject(error);
              }
            },
            `image/${finalOptions.format}`,
            finalOptions.quality
          );
        };
      })
      .catch(error => {
        reject(new Error(`Camera access denied: ${error.message}`));
      });
    });
  }

  /**
   * Select photo from gallery
   */
  async selectFromGallery(options?: PhotoOptions): Promise<PhotoResult> {
    const finalOptions = { ...this.DEFAULT_OPTIONS, ...options };

    return new Promise((resolve, reject) => {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject(new Error('Selected file is not an image'));
          return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          reject(new Error('Image size must be less than 10MB'));
          return;
        }

        try {
          // Compress image
          const compressedResult = await this.compressImage(file, finalOptions);
          resolve(compressedResult);
        } catch (error) {
          reject(error);
        } finally {
          document.body.removeChild(input);
        }
      };

      // Trigger file selection
      input.click();
    });
  }

  /**
   * Compress image to reduce file size
   */
  private async compressImage(file: File, options: PhotoOptions): Promise<PhotoResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            options.maxWidth || this.DEFAULT_OPTIONS.maxWidth!,
            options.maxHeight || this.DEFAULT_OPTIONS.maxHeight!
          );

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          context.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create compressed file
              const compressedFile = new File(
                [blob],
                `compressed_${file.name}`,
                { type: `image/${options.format || this.DEFAULT_OPTIONS.format}` }
              );

              // Create object URLs for preview
              const originalUrl = URL.createObjectURL(file);
              const compressedUrl = URL.createObjectURL(compressedFile);

              // Calculate compression ratio
              const compressionRatio = (compressedFile.size / file.size) * 100;

              resolve({
                originalFile: file,
                compressedFile,
                originalUrl,
                compressedUrl,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio
              });
            },
            `image/${options.format || this.DEFAULT_OPTIONS.format}`,
            options.quality || this.DEFAULT_OPTIONS.quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Check if resizing is needed
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // Calculate aspect ratio
    const aspectRatio = width / height;

    // Resize based on the limiting dimension
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Upload photo to storage service
   */
  async uploadPhoto(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Import Firebase Storage dynamically
      const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
      
      const storage = getStorage();
      const storageRef = ref(storage, path);
      
      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Calculate progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            // Get download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(new Error(`Failed to get download URL: ${error}`));
            }
          }
        );
      });
    } catch (error) {
      throw new Error(`Upload service error: ${error}`);
    }
  }

  /**
   * Generate unique filename for upload
   */
  generateFilename(prefix: string = 'photo'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.jpg`;
  }

  /**
   * Clean up object URLs to prevent memory leaks
   */
  cleanupUrls(urls: string[]): void {
    urls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke URL:', url, error);
      }
    });
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height,
            size: file.size,
            type: file.type
          });
        };

        img.onerror = () => {
          reject(new Error('Failed to load image for metadata'));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file for metadata'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        isValid: false,
        error: 'El archivo debe ser una imagen'
      };
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'La imagen no debe pesar más de 10MB'
      };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return {
        isValid: false,
        error: 'Formato de imagen no soportado. Use JPEG, PNG o WebP'
      };
    }

    return { isValid: true };
  }
}

// Export singleton instance
export const photoCapture = new PhotoCapture();