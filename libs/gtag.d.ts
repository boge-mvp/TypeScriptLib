declare var dataLayer: any[];

// --- gtag 函数多态重载（支持最新 GA4 标准命令及向下兼容签名） ---
declare function gtag(command: "config", targetId: string, config?: Gtag.ControlParams | Gtag.EventParams | Gtag.ConfigParams | Gtag.CustomParams): void;
declare function gtag(command: "set", targetId: string, config: Gtag.CustomParams | boolean | string): void;
declare function gtag(command: "set", config: Gtag.CustomParams): void;
declare function gtag(command: "js", config: Date): void;
declare function gtag(command: "event", eventName: Gtag.EventNames | (string & {}), eventParams?: Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams): void;
declare function gtag(command: "get", targetId: string, fieldName: Gtag.FieldNames | string, callback?: (field: string | Gtag.CustomParams | undefined) => any): void;
declare function gtag(command: "consent", consentArg: Gtag.ConsentArg | (string & {}), consentParams: Gtag.ConsentParams): void;

// --- 谷歌统计 gtag.js (GA4 / Google Tag) 完整类型规范 ---
declare namespace Gtag {
    interface GtagCommands {
        config: [targetId: string, config?: ControlParams | EventParams | ConfigParams | CustomParams];
        set: [targetId: string, config: CustomParams | boolean | string] | [config: CustomParams];
        js: [config: Date];
        event: [eventName: EventNames | (string & {}), eventParams?: ControlParams | EventParams | CustomParams];
        get: [
            targetId: string,
            fieldName: FieldNames | string,
            callback?: (field: string | CustomParams | undefined) => any,
        ];
        consent: [consentArg: ConsentArg | (string & {}), consentParams: ConsentParams];
    }

    interface Gtag {
        <Command extends keyof GtagCommands>(command: Command, ...args: GtagCommands[Command]): void;
    }

    interface ConfigParams {
        page_title?: string;
        page_location?: string;
        page_path?: string;
        send_page_view?: boolean;
        user_id?: string;
        cookie_domain?: string;
        cookie_prefix?: string;
        cookie_expires?: number;
        cookie_update?: boolean;
        cookie_flags?: string;
        debug_mode?: boolean;
        [key: string]: any;
    }

    interface CustomParams {
        [key: string]: any;
    }

    interface ControlParams {
        groups?: string | string[];
        send_to?: string | string[];
        event_callback?: () => void;
        event_timeout?: number;
    }

    type EventNames =
        // 游戏核心推荐事件
        | "earn_virtual_currency"
        | "join_group"
        | "level_end"
        | "level_start"
        | "level_up"
        | "post_score"
        | "spend_virtual_currency"
        | "tutorial_begin"
        | "tutorial_complete"
        | "unlock_achievement"
        // 通用互动事件
        | "login"
        | "sign_up"
        | "share"
        | "search"
        | "select_content"
        | "page_view"
        | "screen_view"
        | "exception"
        | "timing_complete"
        // 电商全链路事件
        | "add_payment_info"
        | "add_shipping_info"
        | "add_to_cart"
        | "add_to_wishlist"
        | "begin_checkout"
        | "checkout_progress"
        | "generate_lead"
        | "purchase"
        | "refund"
        | "remove_from_cart"
        | "select_item"
        | "select_promotion"
        | "set_checkout_option"
        | "view_cart"
        | "view_item"
        | "view_item_list"
        | "view_promotion"
        | "view_search_results";

    interface EventParams {
        // 通用及自定义属性
        event_category?: string;
        event_label?: string;
        value?: number;
        currency?: string;
        description?: string;
        fatal?: boolean;
        method?: string;
        search_term?: string;
        content_type?: string;
        content_id?: string;
        screen_name?: string;

        // 游戏专属参数
        level?: number;
        character?: string;
        score?: number;
        achievement_id?: string;
        virtual_currency_name?: string;
        group_id?: string;

        // 电商专属参数
        items?: Item[];
        promotions?: Promotion[];
        transaction_id?: string;
        shipping?: Currency;
        tax?: Currency;
        coupon?: string;
        discount?: Currency;
        item_list_id?: string;
        item_list_name?: string;
        checkout_step?: number;
        checkout_option?: string;

        // 传输机制
        transport_type?: "image" | "xhr" | "beacon";

        // 允许任意业务自定义参数
        [key: string]: any;
    }

    type Currency = string | number;

    /**
     * 电商或游戏道具列表中的单项结构
     */
    interface Item {
        item_id?: string;
        item_name?: string;
        affiliation?: string;
        coupon?: string;
        currency?: string;
        creative_name?: string;
        creative_slot?: string;
        discount?: Currency;
        index?: number;
        item_brand?: string;
        item_category?: string;
        item_category2?: string;
        item_category3?: string;
        item_category4?: string;
        item_category5?: string;
        item_list_id?: string;
        item_list_name?: string;
        item_variant?: string;
        location_id?: string;
        price?: Currency;
        promotion_id?: string;
        promotion_name?: string;
        quantity?: number;
        [key: string]: any;
    }

    interface Promotion {
        creative_name?: string;
        creative_slot?: string;
        promotion_id?: string;
        promotion_name?: string;
        [key: string]: any;
    }

    type FieldNames = "client_id" | "session_id" | "gclid" | (string & {});

    type ConsentArg = "default" | "update";

    interface ConsentParams {
        ad_personalization?: "granted" | "denied";
        ad_user_data?: "granted" | "denied";
        ad_storage?: "granted" | "denied";
        analytics_storage?: "granted" | "denied";
        functionality_storage?: "granted" | "denied";
        personalization_storage?: "granted" | "denied";
        security_storage?: "granted" | "denied";
        wait_for_update?: number;
        region?: string[];
        [key: string]: any;
    }
}
