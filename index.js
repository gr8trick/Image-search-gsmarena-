export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // Homepage check
    if (!query) {
      return new Response("Lucky Telecom GSM API is Running...", { 
        status: 200,
        headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" } 
      });
    }

    try {
      // GSM Arena Mobile search result fetcher
      const gsmUrl = `https://m.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
      
      const response = await fetch(gsmUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36"
        }
      });

      const html = await response.text();
      const results = [];

      // Regex for image and names extraction
      const imgRegex = /<img src="(https:\/\/fdn2\.gsmarena\.com\/vv\/bigpic\/[^"]+)"/g;
      const nameRegex = /<strong><span>([^<]+)<\/span><\/strong>/g;

      let imgMatch;
      while ((imgMatch = imgRegex.exec(html)) !== null) {
        let nameMatch = nameRegex.exec(html);
        let originalImg = imgMatch[1];
        
        results.push({
          name: nameMatch ? nameMatch[1] : "Mobile Phone",
          image: originalImg,
          // Encrypted-style URL via Weserv Proxy for stability
          encrypted_url: `https://images.weserv.nl/?url=${originalImg.replace('https://', '')}&w=300&il`
        });
      }

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "Backend error" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
