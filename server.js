const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
let port = process.env.port || 8080;

const srv = http.createServer((req, res) => {
    let url = req.url;
    if (req.method === 'GET') {
        switch (url) {
            case '/':
            case 'undefined':
                fs.readFile('./public/index.html', (err, data) => {
                    if (err) {
                        return res.end(`Error: ${err}`);
                    } else {
                        return res.end(data);
                    }
                });
                break;
        };
        fs.readFile(`./public${url}`, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    fs.readFile('./public/404.html', (err, data) => {
                        if (err) {
                            return res.end(`Error: ${err}`);
                        } else {
                            return res.end(data);
                        }
                    });
                } else {
                    return res.end(`Error: ${err}`);
                }
            } else {
                return res.end(data);
            }
        });
    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body = querystring.parse(chunk.toString());
            let htmlTemplate = ` <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>The Elements - ${body.elementName}</title>
        <link rel="stylesheet" href="/css/styles.css">
      </head>
      <body>
        <h1>${body.elementName}</h1>
        <h2>${body.elementSymbol}</h2>
        <h3>Atomic number ${body.elementAtomicNumber}</h3>
        <p>${body.elementDescription}</p>
        <p><a href="/">back</a></p>
      </body>
      </html>`;

            const path = `./public/${body.elementName}.html`;
            fs.writeFile(path, htmlTemplate, (err, data) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        fs.write('File already exists!');
                        res.end();
                    }
                    fs.writeHead(500);
                    return res.end(`{ 'success': false}`);
                }
                return res.end('file created!');
            })
        })

        fs.readdir('./public', (err, files) => {
            if (err) {
                throw new Error(err);
            } else {
                let ignore = ['404.html', 'index.html', 'css', '.keep', '.DS_Store'];
                let eCount = 0;
                let links = '';

                files.forEach(file => {
                    if (!ignore.includes(file)) {
                        eCount++;
                        let linkName = file.slice(0, file.indexOf('.'));
                        linkName = linkName.substring(0, 1).toUpperCase() + linkName.substring(1).toLowerCase();

                        links += `<li>
                        <a href="${file}">${linkName}</a>
                        </li>`;
                    }
                });
                let newIndex = ` <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <title>The Elements</title>
      <link rel="stylesheet" href="/css/styles.css">
    </head>
    
    <body>
      <h1>The Elements</h1>
      <h2>These are all the known elements.</h2>
      <h3>These are ${eCount}</h3>
      <ol>
        ${links}
      </ol>
    </body>
    
    </html>`;

                fs.writeFile('./public/index.html', newIndex, (err, data) => {
                    if (err) {
                        console.log('Error!');
                    }
                });

            }
        });
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        return res.end(`{'success': 'true' }`);

    }
});

srv.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
})