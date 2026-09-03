FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY src/ProductIQ.Domain/ProductIQ.Domain.csproj src/ProductIQ.Domain/
COPY src/ProductIQ.Application/ProductIQ.Application.csproj src/ProductIQ.Application/
COPY src/ProductIQ.Infrastructure/ProductIQ.Infrastructure.csproj src/ProductIQ.Infrastructure/
COPY src/ProductIQ.API/ProductIQ.API.csproj src/ProductIQ.API/

RUN dotnet restore src/ProductIQ.API/ProductIQ.API.csproj

COPY src/ProductIQ.Domain/ src/ProductIQ.Domain/
COPY src/ProductIQ.Application/ src/ProductIQ.Application/
COPY src/ProductIQ.Infrastructure/ src/ProductIQ.Infrastructure/
COPY src/ProductIQ.API/ src/ProductIQ.API/

RUN dotnet publish src/ProductIQ.API/ProductIQ.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
EXPOSE 5000
ENTRYPOINT ["dotnet", "ProductIQ.API.dll"]
