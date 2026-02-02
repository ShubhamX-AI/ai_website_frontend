import type { PixabayResponse } from "./pixabay.types";

const PIXABAY_API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY || "";
const PIXABAY_BASE_URL = "https://pixabay.com/api/";

export async function searchPixabayImages(
    query: string,
    options?: {
        imageType?: "all" | "photo" | "illustration" | "vector";
        orientation?: "all" | "horizontal" | "vertical";
        perPage?: number;
        page?: number;
        safeSearch?: boolean;
    }
): Promise<PixabayResponse> {
    if (!PIXABAY_API_KEY) {
        throw new Error("Pixabay API key is not configured. Please set NEXT_PUBLIC_PIXABAY_API_KEY in your .env file");
    }

    const params = new URLSearchParams({
        key: PIXABAY_API_KEY,
        q: query,
        image_type: options?.imageType ?? "photo",
        orientation: options?.orientation ?? "all",
        per_page: String(options?.perPage ?? 10),
        page: String(options?.page ?? 1),
        safesearch: String(options?.safeSearch ?? true),
    });

    const response = await fetch(`${PIXABAY_BASE_URL}?${params}`);

    if (!response.ok) {
        throw new Error(
            `Pixabay API error ${response.status}: ${await response.text()}`
        );
    }

    return response.json();
}
