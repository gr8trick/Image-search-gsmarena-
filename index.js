export default {
  async fetch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get("q");

    // AGAR USER SEARCH KAR RAHA HAI (API LOGIC)
    if (query) {
      try {
        const gsmUrl = `https://m.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(query)}`;
        const response = await fetch(gsmUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10)" }
        });
        const html = await response.text();
        const results = [];
        const imgRegex = /<img src="(https:\/\/fdn2\.gsmarena\.com\/vv\/bigpic\/[^"]+)"/g;
        const nameRegex = /<strong><span>([^<]+)<\/span><\/strong>/g;

        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
          let nameMatch = nameRegex.exec(html);
          results.push({
            name: nameMatch ? nameMatch[1] : "Mobile Phone",
            image: imgMatch[1],
            encrypted_url: `https://images.weserv.nl/?url=${imgMatch[1].replace('https://', '')}&w=400&il`
          });
        }
        return new Response(JSON.stringify(results), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (e) {
        return new Response(JSON.stringify([]), { headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    // AGAR USER WEBSITE OPEN KAR RAHA HAI (HTML UI)
    const htmlUI = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lucky Telecom - Phone Finder</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; text-align: center; margin: 0; padding: 20px; }
            .container { max-width: 450px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .brand { color: #007bff; font-weight: bold; font-size: 24px; margin-bottom: 5px; display: block; }
            .location { color: #888; font-size: 13px; margin-bottom: 25px; display: block; }
            .search-box { display: flex; gap: 8px; margin-bottom: 20px; }
            input { flex: 1; padding: 15px; border: 2px solid #ddd; border-radius: 12px; outline: none; font-size: 16px; }
            button { padding: 15px 20px; background: #007bff; color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; }
            #gallery { display: grid; grid-template-columns: 1fr; gap: 20px; margin-top: 20px; }
            .card { background: #fff; border: 1px solid #eee; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05); text-align: left; }
            .card img { width: 100%; height: auto; display: block; padding: 10px; box-sizing: border-box; }
            .card-info { padding: 12px; font-weight: bold; color: #333; border-top: 1px solid #eee; background: #f9f9f9; }
            .url-box { padding: 10px; font-size: 10px; color: #666; word-break: break-all; background: #fff; border-top: 1px solid #eee; }
            .loader { display: none; color: #007bff; font-weight: bold; margin: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <span class="brand">Lucky Telecom</span>
            <span class="location">Ballia, Bihar</span>
            <div class="search-box">
                <input type="text" id="phoneInput" placeholder="Model likhein (e.g. Reno 10)">
                <button onclick="search()">Search</button>
            </div>
            <div id="loader" class="loader">🔍 Photo dhund raha hoon...</div>
            <div id="gallery"></div>
            <p style="font-size: 10px; color: #bbb; margin-top: 20px;">Raj Kumar - Lucky Telecom</p>
        </div>
        <script>
            async function search() {
                const query = document.getElementById('phoneInput').value.trim();
                if (!query) return alert("Phone ka naam likhein!");
                const loader = document.getElementById('loader');
                const gallery = document.getElementById('gallery');
                loader.style.display = 'block';
                gallery.innerHTML = '';
                try {
                    const response = await fetch('?q=' + encodeURIComponent(query));
                    const data = await response.json();
                    if (data.length === 0) {
                        gallery.innerHTML = "Bhai, koi photo nahi mili!";
                    } else {
                        data.forEach(phone => {
                            gallery.innerHTML += \`
                                <div class="card">
                                    <img src="\${phone.image}" alt="\${phone.name}">
                                    <div class="card-info">\${phone.name}</div>
                                    <div class="url-box"><strong>URL:</strong> \${phone.encrypted_url}</div>
                                </div>
                            \`;
                        });
                    }
                } catch (e) { gallery.innerHTML = "Error ho gaya!"; }
                loader.style.display = 'none';
            }
        </script>
    </body>
    </html>
    `;

    return new Response(htmlUI, { headers: { "Content-Type": "text/html" } });
  }
};
