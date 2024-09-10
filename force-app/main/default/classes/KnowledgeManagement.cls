public with sharing class KnowledgeManagement {

    public static List<Knowledge__kav> getAllArticlesByOwnerId(Id UserId){
        return [ SELECT Id, KnowledgeArticleId, Title, UrlName, Text__c, BannerImage__c, PublishStatus, Approval_Status__c FROM Knowledge__kav WHERE OwnerId =: UserId AND (PublishStatus = 'Draft' OR PublishStatus = 'Online') WITH SECURITY_ENFORCED];
    }

    public static Knowledge__kav createNewArticleAsADraft(String title, String urlName, String body, String bannerImage, String topicId) {

        Knowledge__kav newArticle = new Knowledge__kav();
        newArticle.Title = title;
        newArticle.UrlName = urlName;
        newArticle.Text__c = body;
        newArticle.BannerImage__c = bannerImage;
        newArticle.Created_by_Community_User__c = true;

        insert newArticle;

        TopicAssignment topicAsgmt = new TopicAssignment(
            EntityId = newArticle.Id,
            TopicId = topicId
        );
        
        insert topicAsgmt;

        return newArticle;
    }

    public static Boolean submitKnowledgeforApproval(Id kaId, Id submitterId){
        // Create an approval request for the account
        Approval.ProcessSubmitRequest req1 = 
            new Approval.ProcessSubmitRequest();
        req1.setComments('Submitting request for approval.');
        req1.setObjectId(kaId);
        
        // Submit on behalf of a specific submitter
        req1.setSubmitterId(submitterId); 
        
        // Submit the record to specific process and skip the criteria evaluation
        req1.setProcessDefinitionNameOrId('CommunityUser_Knowledge_ApprovalProcess');
        req1.setSkipEntryCriteria(false);
        
        // Submit the approval request for the account
        Approval.ProcessResult result = Approval.process(req1);

        return true;
    }

    public static void publishArticle(String recordId) { //It need to be KnowledgeArticleId
        KbManagement.PublishingService.publishArticle(recordId, true);
    }


    public static String unPublishArticle(String recordId){ //It needs to be KnowledgeArticleId
        String newArticleId = KbManagement.PublishingService.editOnlineArticle(recordId, true); //Method new version id use it to update 
        return [SELECT KnowledgeArticleId FROM Knowledge__kav WHERE Id =: newArticleId].KnowledgeArticleId;
    }

    public static String updateDraftArticleWithoutPublish(String title, String urlName, String body, String bannerImage, String topicId, Id recordId) {

        Knowledge__kav newArticle = [ SELECT Id, KnowledgeArticleId, Title, UrlName, Text__c, BannerImage__c FROM Knowledge__kav WHERE KnowledgeArticleId =: recordId ];   
        
        newArticle.Title = title;
        newArticle.UrlName = urlName;
        newArticle.Text__c = body;
        newArticle.BannerImage__c = bannerImage;
        
        update newArticle;

        // TopicAssignment oldTopicAsgmt = [ SELECT EntityId, TopicId FROM TopicAssignment WHERE EntityId = :recordId AND TopicId = :topicId];

        // if (oldTopicAsgmt.TopicId != topicId) {
        //     delete oldTopicAsgmt;
    
        //     TopicAssignment newTopicAsgmt = new TopicAssignment(
        //         EntityId = newArticle.Id,
        //         TopicId = topicId
        //     );
            
        //     insert newTopicAsgmt;
        // }

        return newArticle.KnowledgeArticleId;
    }

    public static String updatetArticle(String title, String urlName, Id recordId) {

        String newVersionId = unPublishArticle(recordId);

        Knowledge__kav newArticle = [ SELECT Id, KnowledgeArticleId, Title, UrlName FROM Knowledge__kav WHERE KnowledgeArticleId =: newVersionId ];   

        newArticle.Title = title;
        newArticle.UrlName = urlName;

        update newArticle;

        publishArticle(newVersionId);

        return newVersionId;
    }

    public static void deleteArticle(Id recordId){

        String newVersionId = unPublishArticle(recordId);

        Knowledge__kav newArticle = [ SELECT Id, KnowledgeArticleId, Title, UrlName FROM Knowledge__kav WHERE KnowledgeArticleId =: newVersionId ];  

        KbManagement.PublishingService.deleteDraftArticle(newArticle.KnowledgeArticleId);

        // return true;
    }
}