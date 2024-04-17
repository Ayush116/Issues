import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Subscription } from "rxjs";

import { Post } from '../post.model';
import { PostService } from "../posts.service";
import { AuthService } from "../../auth/auth.service";

@Component({
    // selector: 'app-post-list',
    styleUrl: './post-list.component.css',
    templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit, OnDestroy {
    // posts = [
    //     { title: 'First Post', content: 'This is the 1st post\'s content.' },
    //     { title: 'Second Post', content: 'This is the 2nd post\'s content.' },
    //     { title: 'Third Post', content: 'This is the 3rd post\'s content.' }
    // ];
    
    isLoading = false;
    userIsAuth = false;
    pageSizeOptions = [1, 2, 5, 10];
    postsPerPage = 5;
    currentPage = 1;
    totalPosts = 10;
    userID: string | undefined;
    posts: Post[] = [
        {
            id: '',
            title: '',
            content: '',
            imagePath: '',
            creator: ''
        }
    ];

    private authStatusSub: Subscription = new Subscription;
    private postsSubscription: Subscription = new Subscription; // to prevent memory leakage if there are many components and then unsubscribe it (at the EOF)

    // constructor is a keyword, whenever angular creates a new instance of the component
    // adding 'public' will enable the 'postService' as an argument incoming as well as making it a property of the current class - PostListComponent
    constructor(public postService: PostService, private authService: AuthService) {}

    ngOnInit() {
        this.isLoading = true;

        // this.posts = this.postService.getPosts(); // commenting, as getPosts doesn't return anything now
        this.postService.getPosts(this.postsPerPage, this.currentPage);
        console.log("Post Service: ", this.postService);
        this.userID = this.authService.getUserId();
        console.log("1. ", this.userID);
        console.log("typeof: ", typeof(this.userID));

        /** subscribe(arguments:
         *      1. Functions whenever new data is emitted
         *      2. Whenever an error is emitted
         *      3. When asObservable has no value to expect and the next function is called
         *  ); */
        this.postsSubscription = this.postService.getPostUpdatedListener()
            .subscribe((postsData: {
                posts: Post[],
                postsCount: number
            }) => {
                this.isLoading = false;
                this.totalPosts = postsData.postsCount;
                this.posts = postsData.posts; // Whenever we caught a new value, it will be stored in 'this.posts[]'
            });
        this.userIsAuth = this.authService.getIsAuthenticated();
        this.authStatusSub = this.authService.getAuthStatusListener()
            .subscribe(isAuth => {
                this.userIsAuth = isAuth;
                this.userID = this.authService.getUserId();
                console.log("2. ",this.userID);
            });
    }

    // Handling Pagination (how many posts can be viewed based on selector)
    onChangedPage(pageData: PageEvent) {
        this.isLoading = true;
        // console.log(pageData);
        this.currentPage = pageData.pageIndex + 1; // At back-end pageIndex starts at '0'
        this.postsPerPage = pageData.pageSize;
        this.postService.getPosts(this.postsPerPage, this.currentPage);
    }

    onDelete(postId?: string | undefined) {
        this.isLoading = true;
        this.postService.deletePost(postId).subscribe(() => {
            this.postService.getPosts(this.postsPerPage, this.currentPage);
        });
    }        

    ngOnDestroy() {
        this.postsSubscription.unsubscribe();
        this.authStatusSub.unsubscribe();
    }
}