import express from 'express';
import morgan from 'morgan';

const app = express();
const PORT = 7000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
app.use(morgan('dev'));

// Webhook Callback Endpoint
app.post('/callback', (req, res) => {
	const timestamp = new Date().toISOString();
	console.log(`\n--- [NEW CALLBACK RECEIVED at ${timestamp}] ---`);
	console.log('HEADERS:', JSON.stringify(req.headers, null, 2));
	console.log('PAYLOAD:', JSON.stringify(req.body, null, 2));
	console.log('--------------------------------------------\n');

	res.status(200).json({
		status: 'received',
		message: 'Webhook logged successfully',
		timestamp
	});
});

// Test GET endpoint
app.get('/callback', (req, res) => {
	res.send('Webhook logger is running. Send a POST request to this endpoint to log data.');
});

app.listen(PORT, () => {
	console.log(`\n🚀 Webhook Logger started on http://localhost:${PORT}`);
	console.log(`📡 Listening for POST requests on http://localhost:${PORT}/callback\n`);
});
