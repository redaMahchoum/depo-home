FROM openjdk:21

WORKDIR /app

# Copy the .war file and application.yaml file into the container
COPY app-name-*.war backend.war

COPY application.yaml application.yaml

EXPOSE 8007

ENTRYPOINT ["java", "-Dspring.config.location=application.yaml", "-jar", "backend.war"]
