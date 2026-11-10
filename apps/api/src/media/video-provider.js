/**
 * Real Provider Abstraction for AI Avatar Video Generation
 * Supports:
 * - 'd-id' (D-ID Talks API: https://api.d-id.com/talks)
 * - 'heygen' (HeyGen API: https://api.heygen.com/v2/video/generate)
 * - 'none' (Development Fallback with clear instructions)
 */

export function createVideoProvider(
  name = process.env.VIDEO_PROVIDER || "none",
) {
  const providerName = name.toLowerCase().trim();

  if (providerName === "d-id") {
    const apiKey = process.env.D_ID_API_KEY || process.env.VIDEO_API_KEY || "";
    return {
      name: "d-id",
      async generateVideo(script, options = {}) {
        if (!apiKey) {
          return {
            jobId: null,
            status: "provider_not_configured",
            message:
              "D-ID provider selected but D_ID_API_KEY is not set in environment variables.",
          };
        }
        try {
          const avatarUrl =
            options.avatarUrl ||
            "https://create-images-results.d-id.com/DefaultPresenters/Noam_m/image.png";
          const response = await fetch("https://api.d-id.com/talks", {
            method: "POST",
            headers: {
              Authorization: `Basic ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              script: {
                type: "text",
                input: script,
                provider: {
                  type: "microsoft",
                  voice_id: options.voiceId || "en-US-JennyNeural",
                },
              },
              source_url: avatarUrl,
            }),
          });
          const data = await response.json();
          if (!response.ok) {
            return {
              jobId: null,
              status: "failed",
              errorMessage: data.message || "D-ID API request failed",
            };
          }
          return {
            jobId: data.id,
            status: "processing",
            message: "Video generation submitted to D-ID",
          };
        } catch (error) {
          return {
            jobId: null,
            status: "failed",
            errorMessage:
              error.message || "Failed to communicate with D-ID API",
          };
        }
      },

      async checkStatus(externalJobId) {
        if (!apiKey) return { status: "provider_not_configured" };
        try {
          const response = await fetch(
            `https://api.d-id.com/talks/${externalJobId}`,
            {
              headers: { Authorization: `Basic ${apiKey}` },
            },
          );
          const data = await response.json();
          if (!response.ok) {
            return {
              status: "failed",
              errorMessage: data.message || "Status check failed",
            };
          }
          if (data.status === "done") {
            return { status: "completed", resultUrl: data.result_url };
          } else if (data.status === "error" || data.status === "rejected") {
            return {
              status: "failed",
              errorMessage: data.error?.description || "D-ID processing failed",
            };
          }
          return { status: "processing" };
        } catch (error) {
          return { status: "failed", errorMessage: error.message };
        }
      },
    };
  }

  if (providerName === "heygen") {
    const apiKey =
      process.env.HEYGEN_API_KEY || process.env.VIDEO_API_KEY || "";
    return {
      name: "heygen",
      async generateVideo(script, options = {}) {
        if (!apiKey) {
          return {
            jobId: null,
            status: "provider_not_configured",
            message:
              "HeyGen provider selected but HEYGEN_API_KEY is not set in environment variables.",
          };
        }
        try {
          const response = await fetch(
            "https://api.heygen.com/v2/video/generate",
            {
              method: "POST",
              headers: {
                "X-Api-Key": apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                video_inputs: [
                  {
                    character: {
                      type: "avatar",
                      avatar_id: options.avatarId || "Daisy-into-20240409",
                      avatar_style: "normal",
                    },
                    voice: {
                      type: "text",
                      input_text: script,
                      voice_id:
                        options.voiceId || "2d5b0e6cf36f460aa7fc47e3eee4ba54",
                    },
                  },
                ],
                dimension: { width: 1280, height: 720 },
              }),
            },
          );
          const data = await response.json();
          if (!response.ok || data.error) {
            return {
              jobId: null,
              status: "failed",
              errorMessage: data.error?.message || "HeyGen API request failed",
            };
          }
          return {
            jobId: data.data?.video_id,
            status: "processing",
            message: "Video generation submitted to HeyGen",
          };
        } catch (error) {
          return {
            jobId: null,
            status: "failed",
            errorMessage:
              error.message || "Failed to communicate with HeyGen API",
          };
        }
      },

      async checkStatus(externalJobId) {
        if (!apiKey) return { status: "provider_not_configured" };
        try {
          const response = await fetch(
            `https://api.heygen.com/v1/video_status.get?video_id=${externalJobId}`,
            {
              headers: { "X-Api-Key": apiKey },
            },
          );
          const data = await response.json();
          if (!response.ok || data.error) {
            return {
              status: "failed",
              errorMessage: data.error?.message || "Status check failed",
            };
          }
          const videoData = data.data;
          if (videoData.status === "completed") {
            return { status: "completed", resultUrl: videoData.video_url };
          } else if (videoData.status === "failed") {
            return {
              status: "failed",
              errorMessage: videoData.error || "HeyGen rendering failed",
            };
          }
          return { status: "processing" };
        } catch (error) {
          return { status: "failed", errorMessage: error.message };
        }
      },
    };
  }

  // Development Fallback
  return {
    name: "none",
    async generateVideo(_script, _options = {}) {
      return {
        jobId: null,
        status: "provider_not_configured",
        message:
          "No video provider is configured. Set VIDEO_PROVIDER (d-id or heygen) and API key in environment variables.",
      };
    },
    async checkStatus(_externalJobId) {
      return { status: "provider_not_configured" };
    },
  };
}
