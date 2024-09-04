public without sharing class KnowledgeController {

    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getKnowledgeArticles(String topicId){
        List<Knowledge__kav> kavRecords = new List<Knowledge__kav>();
        Set<Id> kaRecords = new Set<Id>();

        if(topicId != ''){
            List<TopicAssignment> kaByTopic = [SELECT EntityType, EntityId, Entity.Name, Topic.Name, IsDeleted 
                         FROM TopicAssignment 
                         WHERE Topic.Id = :topicId AND EntityType = 'Knowledge' AND IsDeleted = false];

            for(TopicAssignment ta: kaByTopic){
                kaRecords.add(ta.EntityId);
            }
        }

        if(topicId != ''){
            kavRecords = [SELECT Id, Title, UrlName, ArticleTotalViewCount, LastPublishedDate, BannerImage__c 
                          FROM Knowledge__kav 
                          WHERE IsLatestVersion = true AND IsDeleted = false AND PublishStatus = 'Online' AND Id IN :kaRecords WITH SECURITY_ENFORCED];
        }else{
            kavRecords = [SELECT Id, Title, UrlName, ArticleTotalViewCount, LastPublishedDate, BannerImage__c 
                          FROM Knowledge__kav 
                          WHERE IsLatestVersion = true AND IsDeleted = false AND PublishStatus = 'Online' WITH SECURITY_ENFORCED];
        }

        return kavRecords;
    }
}