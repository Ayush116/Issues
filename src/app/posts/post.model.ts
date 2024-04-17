// adding '?' and '| undefined' - because ERROR at -> PostCreateComponent.ngOnInit() --> this.post = this.postService.getPost(this.postId);
export interface Post {
    id?: string | undefined;
    title?: string | undefined;
    content?: string | undefined;
    imagePath: string;
    creator: string;
}
