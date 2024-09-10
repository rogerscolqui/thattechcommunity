public class KnowledgePublishFlow {
    @InvocableMethod(label='Publish Article' description='Publish knowledge article')
    public static void getMyArticles (List<Request> req){
        if(req[0].publishKaId != ''){
            switch on req[0].statusActionKa {
                when 'Publish' {
                    KnowledgeManagement.publishArticle(req[0].publishKaId);
                }
                when 'Unpublish' {
                    KnowledgeManagement.unPublishArticle(req[0].publishKaId);
                }
                when 'Delete' {
                    KnowledgeManagement.deleteArticle(req[0].publishKaId);
                }
            }
        }
    }
 
    public class Request {
        @InvocableVariable(required=true)
        public String publishKaId;

        @InvocableVariable(required=true)
        public String statusActionKa;
    }
}