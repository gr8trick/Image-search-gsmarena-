export default {
  async fetch(request) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");

    // 1. API Logic: Search Results fetch karega
    if (q) {
      try {
        const gsmUrl = `https://m.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(q)}`;
        const res = await fetch(gsmUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = await res.text();
        const results = [];
        const itemRegex = /<li><a href="([^"]+)"><img src="([^"]+)"[^>]*><strong><span>([^<]+)<\/span><\/strong><\/a><\/li>/g;
        let m;
        while ((m = itemRegex.exec(html)) !== null) {
          results.push({ name: m[3], img: m[2], enc: `https://images.weserv.nl/?url=${m[2].replace('https://', '')}&w=400` });
        }
        return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
      } catch (e) {
        return new Response("[]", { headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    // 2. UI Logic: Lucky Telecom ka professional page
    return new Response(`
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lucky Telecom - Phone Finder</title>
        <style>
            body { font-family: sans-serif; background: #f0f2f5; text-align: center; padding: 20px; margin: 0; }
            .box { max-width: 450px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .brand { color: #007bff; font-weight: bold; font-size: 24px; display: block; }
            .search { display: flex; gap: 8px; margin: 20px 0; }
            input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 10px; outline: none; }
            button { padding: 12px 20px; background: #007bff; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; }
            .card { background: #fff; border: 1px solid #eee; border-radius: 15px; margin-top: 20px; overflow: hidden; text-align: left; }
            .card img { width: 100%; display: block; padding: 10px; box-sizing: border-box; }
            .info { padding: 12px; font-weight: bold; background: #f9f9f9; border-top: 1px solid #eee; }
            .url { padding: 10px; font-size: 10px; word-break: break-all; border-top: 1px solid #eee; color: #666; }
            .copy { width: 100%; background: #28a745; color: white; border: none; padding: 10px; cursor: pointer; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="box">
            <span class="brand">Lucky Telecom</span>
            <div class="search">
                <input type="text" id="p" placeholder="Model Name likho">
                <button onclick="s()">Search</button>
            </div>
            <div id="g"></div>
        </div>
        <script>
            async function s() {
                const q = document.getElementById('p').value;
                if(!q) return;
                const g = document.getElementById('g');
                g.innerHTML = "Searching...";
                const res = await fetch('?q=' + encodeURIComponent(q));
                const data = await res.json();
                g.innerHTML = data.length ? "" : "Bhai, photo nahi mili!";
                data.forEach((i, idx) => {
                    g.innerHTML += '<div class="card"><img src="'+i.img+'"><div class="info">'+i.name+'</div><div class="url" id="u'+idx+'">'+i.enc+'</div><button class="copy" onclick="c(\\'u'+idx+'\\')">Copy URL</button></div>';
                });
            }
            function c(id) {
                const t = document.getElementById(id).innerText;
                navigator.clipboard.writeText(t).then(() => alert("Copied!"));
            }
        </script>
    </body>
    </html>
    `, { headers: { "Content-Type": "text/html" } });
  }
};
