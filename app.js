const express = require('express');
const bodyParser = require('body-parser');
const { sql, poolPromise } = require('./db'); // Certifique-se de que este caminho está correto
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Função para gerar URL curta
function generateShortUrl() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let shortUrl = '';
    for (let i = 0; i < 6; i++) {
        shortUrl += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return shortUrl;
}

// Rota para a página inicial
app.get('/', (req, res) => {
    res.render('index', { shortUrl: null });
});

// Rota para encurtar a URL
app.post('/shorten', async (req, res) => {
    const originalUrl = req.body.original_url;
    const shortUrl = generateShortUrl();

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('originalUrl', sql.VarChar, originalUrl)
            .input('shortUrl', sql.VarChar, shortUrl)
            .query('INSERT INTO urls (original_url, short_url) VALUES (@originalUrl, @shortUrl)');
        
        res.render('index', { shortUrl: `${req.headers.host}/${shortUrl}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro ao encurtar a URL');
    }
});

// Rota para redirecionar a URL curta
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = req.params.shortUrl;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('shortUrl', sql.VarChar, shortUrl)
            .query('SELECT original_url FROM urls WHERE short_url = @shortUrl');
        
        if (result.recordset.length > 0) {
            res.redirect(result.recordset[0].original_url);
        } else {
            res.status(404).send('URL não encontrada');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro ao redirecionar a URL');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});