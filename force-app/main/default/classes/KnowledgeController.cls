public without sharing class KnowledgeController {

    @AuraEnabled(cacheable=true)
    public static List<Topic> getAllFeaturedTopics (){
        List<Topic> topicList = [SELECT Id, Name FROM Topic WHERE ManagedTopicType <> null WITH SECURITY_ENFORCED];
        return topicList;
    }

    @AuraEnabled(cacheable=true)
    public static String getTopicByKnowledgeId(String kaId ){
        TopicAssignment topicAsgmt = [ SELECT EntityId, TopicId FROM TopicAssignment WHERE EntityId = :kaId AND EntityType = 'Knowledge' AND IsDeleted = false];
        return topicAsgmt.TopicId;
    }

    @AuraEnabled(cacheable=true)
    public static Knowledge__kav getKnowledgeById(String kaId ){
        return [ SELECT Id, KnowledgeArticleId, Title, UrlName, Text__c, BannerImage__c, PublishStatus, LastPublishedDate FROM Knowledge__kav WHERE Id = :kaId];
    }

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

    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getKnowledgeArticlesByUser(String UserId){
        Id communityUserId = (UserId != '') ? (Id)UserId : UserInfo.getUserId();
        return KnowledgeManagement.getAllArticlesByOwnerId(communityUserId);
    }

    @AuraEnabled(cacheable=false)
    public static Knowledge__kav createKnowledgeArticle(String title, String urlName, String body, String bannerImage, String topicId){
        Knowledge__kav newKa = KnowledgeManagement.createNewArticleAsADraft(title, urlName, body, bannerImage, topicId);
        return newKa;
        // return null;
    }

    @AuraEnabled(cacheable=false)
    public static String updateKnowledgeArticle(String title, String urlName, String body, String bannerImage, String topicId, Id kaId){
        String updatedKa = KnowledgeManagement.updateDraftArticleWithoutPublish(title, urlName, body, bannerImage, topicId, kaId);
        return updatedKa;
    }

    @AuraEnabled(cacheable=false)
    public static Boolean submitKnowledgeArticleApproval(Id kaId, String UserId){
        Id communityUserId = (UserId != '') ? (Id)UserId : UserInfo.getUserId();
        return KnowledgeManagement.submitKnowledgeforApproval(kaId, communityUserId);
    }

    @AuraEnabled(cacheable=false)
    public static Boolean deleteKnowledgeArticle(Id kaId){

        // Map<String, Object> kaParams = new Map<String, Object>();

        // kaParams.put('knowledgeArticleId', kaId);
        // kaParams.put('statusAction', 'Delete');
        Knowledge__kav kavRecord = [SELECT Id, KnowledgeArticleId FROM Knowledge__kav WHERE Id = :kaId WITH SECURITY_ENFORCED];

        List<Knowledge_Request_CommunityUser__e> kaEventRecordList = new List<Knowledge_Request_CommunityUser__e>();
        Knowledge_Request_CommunityUser__e kaEventRecord = new Knowledge_Request_CommunityUser__e(
                Knowledge_Article_Id__c = kavRecord.KnowledgeArticleId, 
                Knowledge_Action_Name__c = 'Delete'
            );
        kaEventRecordList.add(kaEventRecord);

        System.debug(kaEventRecordList);
        
        List<Database.SaveResult> results = EventBus.publish(kaEventRecordList);
        
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' + err.getStatusCode() );
                }
            }
        }

        return true;
        
    }
}