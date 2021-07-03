FROM nginx:1.19

RUN mkdir -p /usr/share/nginx/html
COPY release/* /usr/share/nginx/html/
