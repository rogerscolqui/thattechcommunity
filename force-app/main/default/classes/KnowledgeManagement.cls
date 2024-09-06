public with sharing class KnowledgeManagement {

    public static Knowledge__kav createNewArticleAsADraft(String title, String urlName, String bannerImage) {

        Knowledge__kav newArticle = new Knowledge__kav();
        newArticle.Title = title;
        newArticle.UrlName = urlName;
        newArticle.BannerImage__c = bannerImage;
        newArticle.Created_by_Community_User__c = true;

        insert newArticle;

        return newArticle;
    }
}