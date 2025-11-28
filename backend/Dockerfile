# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY StudyBuddy.sln .
COPY StudyBuddy.Api/StudyBuddy.Api.csproj StudyBuddy.Api/
COPY StudyBuddy.Api.Tests/StudyBuddy.Api.Tests.csproj StudyBuddy.Api.Tests/

# Restore dependencies
RUN dotnet restore

# Copy remaining source code
COPY . .

# Build the application
RUN dotnet build StudyBuddy.Api/StudyBuddy.Api.csproj -c Release -o /app/build

# Publish the application
RUN dotnet publish StudyBuddy.Api/StudyBuddy.Api.csproj -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy published application
COPY --from=build /app/publish .

# Expose port
EXPOSE 3001

# Set environment variables
ENV ASPNETCORE_URLS=http://+:3001

# Start the application
ENTRYPOINT ["dotnet", "StudyBuddy.Api.dll"]
