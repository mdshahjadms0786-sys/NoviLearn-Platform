import { completeProviderRequest } from "../ai/ai.service.js";
import { AppError } from "../errors.js";
import { prisma } from "../prisma.js";
import { createVideoProvider } from "./video-provider.js";

export async function createVideoJob(userId, topic, sessionId = null) {
  const userPref = await prisma.userPreference.findUnique({
    where: { userId },
  });
  const activeAvatar = await prisma.userAvatar.findFirst({
    where: { userId, isActive: true },
  });

  let styleInstruction = "";
  if (userPref) {
    styleInstruction = `Language: ${userPref.language}, Style: ${userPref.teachingStyle}, Level: ${userPref.explanationLevel}.`;
  }

  const prompt = `Create a short, engaging educational script explaining '${topic}' for a video avatar lesson. ${styleInstruction} Keep it clear, friendly, and 1-2 minutes long when spoken. Format: plain text narrative only.`;

  let script = null;
  try {
    const aiResponse = await completeProviderRequest({
      messages: { system: "You are an AI video scriptwriter.", user: prompt },
    });
    script =
      typeof aiResponse === "string"
        ? aiResponse
        : aiResponse.summary ||
          aiResponse.explanation ||
          JSON.stringify(aiResponse);
  } catch {
    script = `Welcome to this quick lesson on ${topic}. Today we will explore key concepts and practical ideas to help you master this topic!`;
  }

  const providerName = process.env.VIDEO_PROVIDER || "none";
  const provider = createVideoProvider(providerName);

  let job = await prisma.videoJob.create({
    data: {
      userId,
      sessionId,
      topic,
      script,
      provider: provider.name || providerName,
      status: "pending",
    },
  });

  const providerResponse = await provider.generateVideo(script, {
    avatarId: activeAvatar?.avatarData?.presetId,
  });

  if (providerResponse.status === "provider_not_configured") {
    job = await prisma.videoJob.update({
      where: { id: job.id },
      data: {
        status: "no_provider",
        errorMessage:
          providerResponse.message ||
          "No real video provider API key is set in .env",
      },
    });
  } else if (providerResponse.status === "failed") {
    job = await prisma.videoJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorMessage: providerResponse.errorMessage,
      },
    });
  } else {
    job = await prisma.videoJob.update({
      where: { id: job.id },
      data: {
        status: "processing",
        externalJobId: providerResponse.jobId,
      },
    });
  }

  return job;
}

export async function getVideoJob(userId, jobId) {
  let job = await prisma.videoJob.findUnique({
    where: { id: jobId },
  });

  if (!job)
    throw new AppError(404, "VIDEO_JOB_NOT_FOUND", "Video job not found");
  if (job.userId !== userId)
    throw new AppError(403, "FORBIDDEN", "Unauthorized access to video job");

  if (job.status === "processing" && job.externalJobId) {
    const provider = createVideoProvider(job.provider);
    const statusResult = await provider.checkStatus(job.externalJobId);

    if (statusResult.status === "completed" && statusResult.resultUrl) {
      job = await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          resultUrl: statusResult.resultUrl,
        },
      });
    } else if (statusResult.status === "failed") {
      job = await prisma.videoJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          errorMessage:
            statusResult.errorMessage || "Processing failed at provider",
        },
      });
    }
  }

  return job;
}

export async function listVideoJobs(userId, limit = 10) {
  const jobs = await prisma.videoJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return jobs;
}

export async function retryVideoJob(userId, jobId) {
  const existing = await getVideoJob(userId, jobId);

  const provider = createVideoProvider(existing.provider);
  const providerResponse = await provider.generateVideo(
    existing.script || existing.topic,
  );

  if (
    providerResponse.status === "completed" ||
    providerResponse.status === "processing"
  ) {
    return prisma.videoJob.update({
      where: { id: jobId },
      data: {
        status: providerResponse.status,
        externalJobId: providerResponse.jobId,
        resultUrl: providerResponse.resultUrl,
        errorMessage: null,
      },
    });
  }

  return prisma.videoJob.update({
    where: { id: jobId },
    data: {
      status:
        providerResponse.status === "provider_not_configured"
          ? "no_provider"
          : "failed",
      errorMessage: providerResponse.errorMessage || providerResponse.message,
    },
  });
}

export async function uploadFile(
  userId,
  filename,
  mimeType,
  size,
  path,
  content = null,
) {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain",
    "text/markdown",
  ];
  if (!allowedMimeTypes.includes(mimeType.toLowerCase())) {
    throw new AppError(
      400,
      "INVALID_FILE_TYPE",
      "File type not supported. Allowed: PDF, PNG, JPEG, TXT.",
    );
  }

  const maxSizeBytes = 10 * 1024 * 1024;
  if (size > maxSizeBytes) {
    throw new AppError(400, "FILE_TOO_LARGE", "File size exceeds 10MB limit.");
  }

  const fileRecord = await prisma.fileUpload.create({
    data: {
      userId,
      filename,
      mimeType,
      size,
      path,
      content,
      status: "uploaded",
    },
  });

  return fileRecord;
}

export async function analyzeUploadedFile(userId, fileId, action) {
  const validActions = ["explain", "summarize", "quiz", "notes", "visualize"];
  if (!validActions.includes(action)) {
    throw new AppError(
      400,
      "INVALID_ACTION",
      `Action '${action}' not supported. Allowed: ${validActions.join(", ")}`,
    );
  }

  const fileRecord = await prisma.fileUpload.findFirst({
    where: { id: fileId, userId },
  });

  if (!fileRecord) {
    throw new AppError(404, "FILE_NOT_FOUND", "Uploaded file not found.");
  }

  const sourceText =
    fileRecord.content ||
    `Document: ${fileRecord.filename} (${fileRecord.mimeType})`;

  let prompt = "";
  if (action === "explain") {
    prompt = `Explain the core concepts and ideas from this study material in simple, clear terms:\n\n${sourceText}`;
  } else if (action === "summarize") {
    prompt = `Provide a concise executive summary and key takeaways from this study material:\n\n${sourceText}`;
  } else if (action === "quiz") {
    prompt = `Generate 5 practice questions with answers and explanations based on this study material:\n\n${sourceText}`;
  } else if (action === "notes") {
    prompt = `Format structured, comprehensive revision study notes with bullet points from this material:\n\n${sourceText}`;
  } else if (action === "visualize") {
    prompt = `Create a step-by-step visual flowchart sequence representing the concepts in this material:\n\n${sourceText}`;
  }

  let aiAnalysis = null;
  try {
    const raw = await completeProviderRequest({
      messages: {
        system:
          "You are NoviLearn, an AI study assistant processing student study materials.",
        user: prompt,
      },
    });
    aiAnalysis =
      typeof raw === "string"
        ? raw
        : raw.explanation || raw.summary || JSON.stringify(raw);
  } catch {
    aiAnalysis = `Analysis for ${fileRecord.filename}: This document covers key concepts related to ${fileRecord.filename.replace(/\.[^/.]+$/, "")}.`;
  }

  await prisma.fileUpload.update({
    where: { id: fileId },
    data: {
      status: "processed",
      metadata: {
        lastAction: action,
        lastAnalyzedAt: new Date().toISOString(),
      },
    },
  });

  return {
    fileId,
    filename: fileRecord.filename,
    action,
    analysis: aiAnalysis,
    processedAt: new Date().toISOString(),
  };
}

export async function listFiles(userId, limit = 20) {
  return prisma.fileUpload.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
