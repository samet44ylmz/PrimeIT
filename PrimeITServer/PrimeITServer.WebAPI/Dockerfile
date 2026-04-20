FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["PrimeITServer.WebAPI/PrimeITServer.WebAPI.csproj", "PrimeITServer.WebAPI/"]
COPY ["PrimeITServer.Application/PrimeITServer.Application.csproj", "PrimeITServer.Application/"]
COPY ["PrimeITServer.Domain/PrimeITServer.Domain.csproj", "PrimeITServer.Domain/"]
COPY ["PrimeITServer.Infrastructure/PrimeITServer.Infrastructure.csproj", "PrimeITServer.Infrastructure/"]
RUN dotnet restore "PrimeITServer.WebAPI/PrimeITServer.WebAPI.csproj"

COPY . .
WORKDIR "/src/PrimeITServer.WebAPI"
RUN dotnet build "PrimeITServer.WebAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PrimeITServer.WebAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PrimeITServer.WebAPI.dll"]
