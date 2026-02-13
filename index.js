export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // Homepage ya bina query ke request handling
    if (!query) {
      return new Response("Lucky Telecom GSM API is Running...", { status: 200 });
    }

    try {
      // GSM Arena Mobile search result page
      const gsmUrl = `https://m.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
      
      const response = await fetch(gsmUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36"
        }
      });

      const html = await response.text();
      const results = [];

      // Regex to find images and names
      const imgRegex = /<img src="(https:\/\/fdn2\.gsmarena\.com\/vv\/bigpic\/[^"]+)"/g;
      const nameRegex = /<strong><span>([^<]+)<\/span><\/strong>/g;

      let imgMatch;
      let nameMatch;

      while ((imgMatch = imgRegex.exec(html)) !== null) {
        nameMatch = nameRegex.exec(html);
        results.push({
          name: nameMatch ? nameMatch[1] : "Mobile Phone",
          // Original image from GSM Arena
          image: imgMatch[1],
          // Encrypted-style URL format (Proxy via weserv for stability)
          encrypted_url: `https://images.weserv.nl/?url=${imgMatch[1].replace('https://', '')}&w=300&il`
        });
      }

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Sabse important: Taki index.html se connect ho sake
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "Data fetch nahi ho paya" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
};
