import { inngest } from "./client";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import { prisma } from "@/lib/db";
import { SANDBOX_TIMEOUT } from "@/types";

// Helper function to provide image information to the AI agent
const getAvailableImages = () => {
  const cloudinaryBaseUrl = "https://res.cloudinary.com/dpsxjxplc/image/upload";
  
  return {
    Food: {
      paths: ["burger.webp", "fruit.webp", "pancakes.webp", "platter-of-food.webp"],
      urls: [
        `${cloudinaryBaseUrl}/v1752172002/burger_ynbpze.webp`,
        `${cloudinaryBaseUrl}/v1752172001/pancakes_njmfzj.webp`,
        `${cloudinaryBaseUrl}/v1752172001/pancakes_njmfzj.webp`,
        `${cloudinaryBaseUrl}/v1752172002/platter-of-food_x97rza.webp`
      ]
    },
    hero: {
      paths: ["hero1.webp", "hero2.webp", "hero3.webp"],
      urls: [
        `${cloudinaryBaseUrl}/v1752172030/hero-passion_k9dnlx.webp`,
        `${cloudinaryBaseUrl}/v1752172029/hero-bg-2_aq3tnb.webp`,
        `${cloudinaryBaseUrl}/v1752172028/hero-bg_qr4k6t.webp`
      ]
    },
    movies: {
      paths: ["batman.webp", "frozen.webp", "moana.webp", "spiderman.webp", "deadpool.webp"],
      urls: [
        `${cloudinaryBaseUrl}/v1752172059/batman_k22quh.webp`,
        `${cloudinaryBaseUrl}/v1752172060/frozen_tlushv.webp`,
        `${cloudinaryBaseUrl}/v1752172061/moana_cmemuj.webp`,
        `${cloudinaryBaseUrl}/v1752172062/spiderman_irh7iy.webp`,
        `${cloudinaryBaseUrl}/v1752172060/deadpool_zwdwdh.webp`
      ]
    },
    nature: {
      paths: ["eagle.webp", "lions.webp", "mountain.webp", "petra-walls.webp"],
      urls: [
        `${cloudinaryBaseUrl}/v1752172080/eagle_il7jjw.webp`,
        `${cloudinaryBaseUrl}/v1752172082/lions_ec1tcb.webp`,
        `${cloudinaryBaseUrl}/v1752172083/mountain_dv66cd.webp`,
        `${cloudinaryBaseUrl}/v1752172084/petra-walls_u4pvvz.webp`
      ]
    },
    products: {
      paths: ["apple-devices.webp", "cam.webp", "playstation5.webp", "watch.webp", "shoes.webp"],
      urls: [
        `${cloudinaryBaseUrl}/v1752171976/apple-devices_pnfq5t.webp`,
        `${cloudinaryBaseUrl}/v1752171976/cam_dhmqtm.webp.webp`,
        `${cloudinaryBaseUrl}/v1752171976/playstation_5_kmkaf9.webp`,
        `${cloudinaryBaseUrl}/v1752171977/watch_wz9kmu.webp`,
        `${cloudinaryBaseUrl}/v1752171976/shoes_ua1bbe.webp`
      ]
    }
  };
};

interface AgentState {
  summary: string;
  files: { [path: string]: string };
  availableImages?: Record<string, {
    paths: string[];
    urls: string[];
  }>;
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("app-creator-test");
      await sandbox.setTimeout(SANDBOX_TIMEOUT);
      return sandbox.sandboxId;
    });
    
    // Create next.config.js in the sandbox to support Cloudinary images
    await step.run("create-next-config", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        await sandbox.files.write("next.config.js", `
// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dpsxjxplc/image/upload/**',
      },
    ],
  },
};

module.exports = nextConfig;
`);
        return "next.config.js created successfully";
      } catch (e) {
        console.error(`Failed to create next.config.js: ${e}`);
        return `Failed to create next.config.js: ${e}`;
      }
    });
    
    const prevMessages = await step.run(
      "get-last-assistant-message",
      async () => {
        const formattedMessages: Message[] = [];
        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        });
        for (const message of messages) {
          formattedMessages.push({
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            type: "text",
            content: message.content,
          });
        }
        return formattedMessages.reverse();
      }
    );
    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
        availableImages: getAvailableImages()
      },
      { messages: prevMessages }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: { temperature: 0.1 },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await getSandbox(sandboxId);
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (e) {
                console.error(
                  `command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
                );
                return `command failed: ${e}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updateFiles = (await network.state.data.files) || {};
                  const sandbox = await getSandbox(sandboxId);
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updateFiles[file.path] = file.content;
                  }

                  return updateFiles;
                } catch (e) {
                  console.error(`createOrUpdateFiles failed: ${e}`);
                  return `createOrUpdateFiles failed: ${e}`;
                }
              }
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                console.error(`readFiles failed: ${e}`);
                return `readFiles failed: ${e}`;
              }
            });
          },
        }),
        createTool({
          name: "getAvailableImages",
          description: "Get information about available images for use in the application",
          parameters: z.object({}),
          handler: async () => {
            const images = getAvailableImages();
            return JSON.stringify({
              message: "Use these Cloudinary-hosted images in your application by referencing their URLs directly",
              availableImages: images,
              usage: {
                nextImage: "Import Image from 'next/image' and use the src attribute with the Cloudinary URL",
                example: "<Image src=\"https://res.cloudinary.com/dpsxjxplc/image/upload/v1752172082/lions_ec1tcb.webp\" alt=\"Lions\" width={800} height={600} />",
                transformations: "You can add Cloudinary transformations by modifying the URL, e.g. adding /c_crop,g_face/ before the version number for face detection cropping"
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantTextMessageText && network) {
            if (lastAssistantTextMessageText.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantTextMessageText;
            }
          }
          return result;
        },
      },
    });
    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent<AgentState>({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-4o",
        defaultParameters: { temperature: 0.1 },
      }),
    });
    const responseGenerator = createAgent<AgentState>({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-4o",
        defaultParameters: { temperature: 0.1 },
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );
    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generatedFragmentTitle = () => {
      const fragmentTitle = fragmentTitleOutput[0];
      if (fragmentTitle.type !== "text") {
        return "Fragment";
      }
      if (Array.isArray(fragmentTitle.content)) {
        return fragmentTitle.content.map((txt) => txt).join("");
      }
      return fragmentTitle.content;
    };
    const generatedResponse = () => {
      const response = responseOutput[0];
      if (response.type !== "text") {
        return "Here you go!";
      }
      if (Array.isArray(response.content)) {
        return response.content.map((txt) => txt).join("");
      }
      return response.content;
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generatedResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: generatedFragmentTitle(),
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
