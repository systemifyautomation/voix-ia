# Deployment Guide

## Prerequisites

Before deploying Voix-IA, ensure you have:

1. **Twilio Account**
   - Sign up at https://www.twilio.com
   - Purchase a phone number with voice capabilities
   - Note your Account SID and Auth Token

2. **OpenAI Account**
   - Sign up at https://platform.openai.com
   - Create an API key
   - Ensure you have credits for API usage

3. **Hosting Platform** (choose one)
   - Heroku
   - AWS (ECS, EC2, or Lambda)
   - Google Cloud Platform (Cloud Run or Compute Engine)
   - Azure (App Service or Container Instances)
   - DigitalOcean (Droplets or App Platform)
   - Render
   - Railway

## Deployment Options

### Option 1: Heroku (Recommended for beginners)

1. Install Heroku CLI:
   ```bash
   npm install -g heroku
   ```

2. Login to Heroku:
   ```bash
   heroku login
   ```

3. Create a new Heroku app:
   ```bash
   heroku create your-voix-ia-app
   ```

4. Set environment variables:
   ```bash
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set TWILIO_PHONE_NUMBER=your_number
   heroku config:set OPENAI_API_KEY=your_key
   heroku config:set BUSINESS_NAME="Your Restaurant"
   ```

5. Deploy:
   ```bash
   git push heroku main
   ```

6. Configure Twilio webhooks:
   - Voice webhook: `https://your-voix-ia-app.herokuapp.com/voice/incoming`
   - Status callback: `https://your-voix-ia-app.herokuapp.com/voice/status`

### Option 2: Docker on any VPS

1. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```

2. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt-get install docker-compose
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/systemifyautomation/voix-ia.git
   cd voix-ia
   ```

4. Create `.env` file:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your credentials
   ```

5. Start the service:
   ```bash
   docker-compose up -d
   ```

6. Set up reverse proxy (nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option 3: AWS ECS with Fargate

1. Build and push Docker image to ECR:
   ```bash
   aws ecr create-repository --repository-name voix-ia
   docker build -t voix-ia .
   docker tag voix-ia:latest <account-id>.dkr.ecr.<region>.amazonaws.com/voix-ia:latest
   aws ecr get-login-password | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/voix-ia:latest
   ```

2. Create ECS task definition with environment variables

3. Create ECS service with Application Load Balancer

4. Configure Twilio webhooks with ALB URL

### Option 4: Google Cloud Run

1. Build and deploy:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/voix-ia
   gcloud run deploy voix-ia \
     --image gcr.io/PROJECT-ID/voix-ia \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars TWILIO_ACCOUNT_SID=xxx,TWILIO_AUTH_TOKEN=xxx,OPENAI_API_KEY=xxx
   ```

2. Note the service URL and configure Twilio webhooks

### Option 5: Railway (Easiest)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your voix-ia repository
4. Add environment variables in Railway dashboard
5. Railway will automatically deploy and provide a URL
6. Configure Twilio webhooks with Railway URL

## Post-Deployment Steps

### 1. Configure Twilio Webhooks

In your Twilio console:
1. Go to Phone Numbers → Manage → Active Numbers
2. Click on your phone number
3. Under "Voice & Fax":
   - **A Call Comes In**: `https://your-domain.com/voice/incoming` (HTTP POST)
   - **Status Callback URL**: `https://your-domain.com/voice/status` (HTTP POST)
4. Save changes

### 2. Test the System

1. Call your Twilio phone number
2. Listen to the AI greeting
3. Try making a reservation
4. Check server logs to verify everything works

### 3. Monitor and Maintain

**Check health endpoint:**
```bash
curl https://your-domain.com/health
```

**View logs:**
- Heroku: `heroku logs --tail`
- Docker: `docker-compose logs -f`
- Cloud platforms: Use their respective logging interfaces

**Monitor costs:**
- Twilio: Check usage in console
- OpenAI: Monitor API usage
- Hosting: Track compute/bandwidth usage

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=3000
```

### Staging
```env
NODE_ENV=staging
PORT=3000
```

### Production
```env
NODE_ENV=production
PORT=3000
# Use production-grade OpenAI model
OPENAI_MODEL=gpt-4
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Deploy multiple instances
- Share reservation data via database

### Database Integration
For production use, replace in-memory storage with a database:

1. **PostgreSQL** (recommended):
   ```bash
   npm install pg
   ```

2. **MongoDB**:
   ```bash
   npm install mongodb
   ```

3. Update `ReservationService.ts` to use database queries

### Caching
- Use Redis for session/conversation caching
- Cache OpenAI responses for common queries

## Security Checklist

- [ ] HTTPS enabled (required by Twilio)
- [ ] Environment variables secured
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Twilio webhook signature validation
- [ ] CORS configured properly
- [ ] Regular security updates
- [ ] Monitoring and alerting set up

## Troubleshooting Deployment Issues

### "Cannot connect to Twilio"
- Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are correct
- Check server logs for detailed error messages

### "OpenAI API error"
- Verify OPENAI_API_KEY is valid
- Check you have sufficient credits
- Ensure model name is correct (gpt-4 vs gpt-3.5-turbo)

### "Webhook not receiving calls"
- Ensure server is publicly accessible
- Verify webhook URL is HTTPS (required)
- Check Twilio webhook configuration
- Test health endpoint is accessible

### "Application won't start"
- Check all required environment variables are set
- Review build logs for errors
- Verify port configuration

## Maintenance

### Updating the Application

1. Pull latest changes:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

### Backup Strategy

- Export reservations regularly
- Backup environment variables
- Keep deployment scripts versioned

### Monitoring

Set up monitoring for:
- Server uptime
- Response times
- Error rates
- Twilio call success rates
- OpenAI API latency

## Cost Estimation

**Monthly costs (estimated):**
- Twilio phone number: ~$1/month
- Twilio usage: ~$0.013/minute of call time
- OpenAI API: Varies by usage (~$0.03/1K tokens for GPT-4)
- Hosting: 
  - Heroku: $7-25/month
  - Railway: $5-20/month
  - AWS/GCP/Azure: Varies by usage
  - VPS: $5-20/month

**Example:**
- 100 calls/month × 2 min average = $2.60
- 100 calls × 500 tokens average = $1.50
- Hosting: $10
- **Total: ~$15/month**

## Support

For deployment help:
- Open an issue on GitHub
- Check Twilio documentation: https://www.twilio.com/docs
- Check OpenAI documentation: https://platform.openai.com/docs
