import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs"; // same as EventEmitter, but not in "@angular/core" but with broader perspective
import { map } from "rxjs/operators";

import { Post } from "./post.model";

@Injectable({providedIn: 'root'}) // this is same as putting the class in 'providers:[]' section of 'app.module.ts' file
export class PostService {
    private posts: Post[] = [];
    private postsUpdated = new Subject<{posts: Post[], postsCount: number}>();

    // Injecting HttpClient in service to centralize the access
    constructor(private httpClient: HttpClient, private router: Router) {}

    /** Removing this as on every subscribe() [add / update / delete] 'ngOnInit()' at 'post.list.component.ts' is getting called which will navigate simply to the page and posts will be fetched accordingly.
        // To handle saving of post and navigating back to home page.
        savePostAndNavigate() {
            this.postsUpdated.next([...this.posts]);
            this.router.navigate(["/"]);
        } */
    
    getPosts(postsPerPage: number, currentPage: number) {
        // return [...this.posts]; // creating new array with objects of old array. As in JS/TS, the array is only referenced so the memory stays the same while the address is only stored.

        // `` -> template expression - special-JS-feature which allows us to dynamically add values into a string e.g. [ http://localhost:3000/api/posts?pagesize=1&page=2 ]
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;

        // this.httpClient.get('http://localhost:3000/api/posts'); // if listening is not enabled then it will not work as it is an Observable.
        this.httpClient.get<{ message: string, posts: any, totalPosts: number }>('http://localhost:3000/api/posts' + queryParams)
            .pipe(map(postData => { // pipe with map-operator helps to reform every element of an array to new element of new array
                return { // returning an object with two props 1. posts and 2. totalCount
                    posts: postData.posts.map((post: any) => {
                        // console.log(post);
                        return {
                            id: post._id,
                            title: post.title,
                            content: post.content,
                            imagePath: post.imagePath,
                            creator: post.creator
                        };
                    }),
                    totalPosts: postData.totalPosts
                };
            }))
            .subscribe((metamorphedPosts) => { // response of getPosts() which will be shown in webpage
                this.posts = metamorphedPosts.posts;
                console.log("Post-service --> get(POSTS): ", this.posts);
                this.postsUpdated.next({ // inform the app about the update
                    posts: [...this.posts],
                    postsCount: metamorphedPosts.totalPosts
                });
            });
    }

    getPostUpdatedListener() {
        return this.postsUpdated.asObservable();
    }

    /** After EDIT button, this will fetch the local data of Post[] to edit the post we want to retrieve the post even after reload of the edit page.
     * So replacing the retur object from local post array to an Observable which is a part of Angular-http client.
     * And in the ngOnInit() at post-create.component.ts, we will subscribe to post[] instead of just adding to local[]
     *  getPost(postId: string) {
     *      return { ...this.posts.find(p => p.id === postId) }; // {...} - spread operator -> pull out all the objects in a property and put them in a new object (clone here) - which means we are not manipulating the original one
     *  }
     */
        getPost(postId: string) {
            return this.httpClient.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>('http://localhost:3000/api/posts/' + postId);
            // return this.httpClient.get<Post>('http://localhost:3000/api/posts/' + postId);
        }

    addPosts(title: string, content: string, image: File) {
        // Removing Post to PostData to handle not just JSON text but also images/files
        const postData = new FormData(); // FormData is an Obj provided by JS to help combined text values and blobs (or file values)
        postData.append("title", title);
        postData.append("content", content);
        postData.append("image", image, title); 

        // Updating the post at server-side
        this.httpClient.post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
            .subscribe(response => {
                this.router.navigate(["/"]);
            });
    }

    updatePost(postId: string, title: string, content: string, image: File | string) {
        // const post: Post = { id: postId, title: title, content: content, imagePath: '' }; // replacing this with below code
        let postData: Post | FormData;
        if (typeof(image) === 'object') {
            postData = new FormData();
            postData.append("id", postId);
            postData.append("title", title);
            postData.append("content", content);
            postData.append("image", image, title);
        } else {
            postData = {
                id: postId,
                title: title,
                content: content,
                imagePath: image,
                creator: '' // handling at the server-side ONLY and not to give user, the chance to meddle
            };
        }
        this.httpClient.put('http://localhost:3000/api/posts/' + postId, postData)
            .subscribe(response => {
                this.router.navigate(["/"]);
            });
        // this.httpClient.patch(); //will be enabled when patch() is implemented at app.js
    }

    deletePost(postId?: string | undefined) {
        /** Commenting this functionality out to handle where delete-button is getting clicked.
        this.httpClient.delete('http://localhost:3000/api/posts/' + postId)
            .subscribe(() => {
                // console.log('Deleted!!');
                const updatedPosts = this.posts.filter(post => post.id !== postId); // fiter() --> if true then it will be part of filter[] and if false, then excluded
                this.posts = updatedPosts;
                this.postsUpdated.next([...this.posts]);
            });
        */
        return this.httpClient.delete('http://localhost:3000/api/posts/' + postId);
    }
}