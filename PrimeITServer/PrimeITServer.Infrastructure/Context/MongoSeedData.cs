using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using PrimeITServer.Domain.Entities;
using PrimeITServer.Infrastructure.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PrimeITServer.Infrastructure.Context;

public static class MongoSeedData
{
    public static async Task Initialize(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var options = scope.ServiceProvider.GetRequiredService<IOptions<MongoDbOptions>>();
        var mongoClient = new MongoClient(options.Value.ConnectionString);
        var mongoDatabase = mongoClient.GetDatabase(options.Value.DatabaseName);
        // MongoDB creates database and collection lazily upon first insert
        var resumesCollection = mongoDatabase.GetCollection<BsonDocument>("Resumes");

        if (await resumesCollection.CountDocumentsAsync(new BsonDocument()) == 0)
        {
            var seedData = new BsonDocument
            {
                { "_id", Guid.NewGuid().ToString() },
                { "UserId", Guid.NewGuid().ToString() },
                { "Summary", "Senior Software Engineer with 10 years of experience in .NET, CQRS, and React architecture." },
                { "Skills", new BsonArray { "C#", ".NET Core", "React", "MongoDB", "PostgreSQL", "Elasticsearch" } },
                { "Experiences", new BsonArray 
                    {
                        new BsonDocument 
                        { 
                            { "CompanyName", "Tech Corp Global" }, 
                            { "Title", "Senior Full Stack Developer" }, 
                            { "StartDate", new DateTime(2020, 5, 1) }, 
                            { "IsCurrent", true }, 
                            { "Description", "Leading a team of 8. Designed and implemented microservices architecture." } 
                        }
                    }
                },
                { "Educations", new BsonArray 
                    {
                        new BsonDocument 
                        { 
                            { "SchoolName", "MIT" }, 
                            { "Degree", "BSc" }, 
                            { "FieldOfStudy", "Computer Science" }, 
                            { "StartDate", new DateTime(2016, 9, 1) }, 
                            { "EndDate", new DateTime(2020, 6, 1) } 
                        }
                    }
                },
                { "CreatedAt", DateTime.UtcNow },
                { "UpdatedAt", DateTime.UtcNow }
            };

            await resumesCollection.InsertOneAsync(seedData);
        }
    }
}
