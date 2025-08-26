import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Books

const server = new McpServer({
    name: "book-mcp",
    version: "1.0.0"
});

// Register a tool to fetch book details
server.registerTool(
    "fetch-book",
    {
        title: "Book Fetcher",
        description: "Get details about a book",
        inputSchema: { name: z.string() }
    },
    async ({ name }) => {
        // Use Google Books API to search for books by name
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(name)}`);
        const data = await response.json();
        let text = "No results found.";
        if (data.items && data.items.length > 0) {
            const book = data.items[0].volumeInfo;
            text = `Title: ${book.title}\nAuthors: ${book.authors ? book.authors.join(", ")
                : "N/A"}\nPublished: ${book.publishedDate || "N/A"}
                \nDescription: ${book.description ? book.description.substring(0, 200) + (book.description.length > 200 ? '...' : '')
                    : "N/A"}`;
        }
        return {
            content: [{ type: "text", text }]
        };
    }
);

// Start the server with stdin/stdout transport
const transport = new StdioServerTransport();
await server.connect(transport);