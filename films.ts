import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "films-mcp",
    version: "1.0.0"
});

// Register a tool to fetch film details
server.registerTool(
    "fetch-film",
    {
        title: "Film Fetcher",
        description: "Get details about all studio ghibli films",
        inputSchema: { name: z.string() }
    },
    async ({ name }) => {
        let result = "";
        // Use Studio Ghibli API to search for films by title (no API key required)
        const response = await fetch("https://ghibliapi.vercel.app/api/films");
        const films = await response.json();
        // Return the film details in a formatted JSON string

        result = `All studio ghibli films are ${JSON.stringify(films, null, 2)}`;
        return {
            content: [{ type: "text", text: result }]
        };
    }
);

// Start the server with stdin/stdout transport
const transport = new StdioServerTransport();
await server.connect(transport);