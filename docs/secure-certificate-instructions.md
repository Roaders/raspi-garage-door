
# Steps for ssl certificate generation

1.- Create a free account on dynu.com.

2.- Create a Dynamic DNS Service on dynu.com. Here you add your subdomain and choose the base domain (there are a few to choose, in this example I will use mydyndomain as subdomain and dynu.net as base domain)

3.- Once the domain is created, go to Control Panel -> API Credentials and click on button Reset Credentials, now take note of Client ID and Secret (we will use them later).

4.- Here you could install their dynamic client so it will update your dynamic address or use wget, etc. more info here https://www.dynu.com/DynamicDNS/IPUpdateClient

5.- Install acme.sh client (more info in https://acme.sh)

curl https://get.acme.sh | sh

6.- Once installed, issue the cert for your domain. Here we will export 2 variables containing the previously created Client ID and Secret (obvously you need to replace the content of these variables with the real data):

export Dynu_ClientId="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export Dynu_Secret="yyyyyyyyyyyyyyyyyyyyyyyyy"
acme.sh --issue --dns dns_dynu -d mydyndomain.dynu.net

https://community.letsencrypt.org/t/failed-authorization-procedure-the-server-could-not-connect-to-the-client-to-verify-the-domain/60656/2