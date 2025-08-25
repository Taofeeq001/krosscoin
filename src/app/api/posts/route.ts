
import { NextResponse } from "next/server";
import { JSDOM } from 'jsdom';

export async function GET(req: Request) {
    const base_url = "https://medium.com/@krosscoin_team";

    try {
        const response = await fetch(base_url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // "<<<<<<<<<<<<<<<<Extract posts from the articles>>>>>>>>>>>>>>>>"
        const articles = document.querySelectorAll('article');
        const posts = Array.from(articles).map((article) => {
            const titleElement = article.querySelector('h2') || article.querySelector('h1') || article.querySelector('h3');
            const title = titleElement?.textContent?.trim() || 'No title';
            
            const linkElement = article.querySelector('a');
            const relativeLink = linkElement?.getAttribute('href') || '';
            const link = relativeLink.startsWith('http') ? relativeLink : `https://medium.com${relativeLink}`;
            
            
            const imageElement = article.querySelector('img');
            const image = imageElement?.getAttribute('src') || '/placeholder-image.jpg';
            
           
            const excerptElement = article.querySelector('h3.mm') || article.querySelector('h3');
            const excerpt = excerptElement?.textContent?.trim() || 'No description available';
            
            
            const dateElement = article.querySelector('time') || article.querySelector('[datetime]') || article.querySelector('span');
            let date = dateElement?.textContent?.trim() || new Date().toISOString();
            
            
            if (date.includes('Feb') || date.includes('Mar') || date.includes('Apr') || 
                date.includes('May') || date.includes('Jun') || date.includes('Jul') ||
                date.includes('Aug') || date.includes('Sep') || date.includes('Oct') ||
                date.includes('Nov') || date.includes('Dec') || date.includes('Jan')) {
                
            } else {
                date = new Date().toISOString();
            }
            
            
            const textContent = article.textContent || '';
            const tags = [];
            
            
            if (textContent.includes('Krosscoin')) tags.push('Krosscoin');
            if (textContent.includes('Hashgreed')) tags.push('Hashgreed');
            if (textContent.includes('Blockchain')) tags.push('Blockchain');
            if (textContent.includes('NFT')) tags.push('NFT');
            if (textContent.includes('Web3')) tags.push('Web3');
            if (textContent.includes('Tokenization')) tags.push('Tokenization');
            
          
            if (tags.length === 0) {
                tags.push('Krosscoin', 'Blockchain');
            }

            return {
                title,
                date,
                link,
                excerpt,
                image,
                tags
            };
        });

     
        const validPosts = posts.filter(post => 
            post.title !== 'No title' && 
            post.link !== 'https://medium.com' &&
            post.image !== '/placeholder-image.jpg'
        );

        return NextResponse.json(validPosts);
        
    } catch (error) {
        console.error("Error fetching Medium content:", error);
        return NextResponse.json(
            { 
                error: error instanceof Error ? error.message : "Unknown error" 
            },
            { status: 500 }
        );
    }
}