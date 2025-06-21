//
//  ViewController.swift
//  JSONSpruce
//
//  Created by Brandon Kepros on 6/20/25.
//

import UIKit
import WebKit

class ViewController: UIViewController, WKNavigationDelegate {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()
        
        webView.navigationDelegate = self
        webView.scrollView.isScrollEnabled = true
        
        if let htmlURL = Bundle.main.url(forResource: "Main", withExtension: "html", subdirectory: "Base.lproj") {
            webView.loadFileURL(htmlURL, allowingReadAccessTo: Bundle.main.resourceURL!)
        }
    }
}