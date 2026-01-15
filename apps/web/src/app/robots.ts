import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://autevo.com.br";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/dashboard", "/admin", "/api", "/setup", "/activate"],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
