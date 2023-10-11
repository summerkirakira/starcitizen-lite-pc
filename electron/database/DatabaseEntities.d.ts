export interface User {
    id: number,
    name: string,
    
    login_id: number,
    email: string,
    password: string,
    rsi_token: string,
    rsi_device: string,
  
    handle: string,
    profile_image: string,
    referral_code: string,
    referral_prospects: number,
    referral_count: number,

    usd: number,
    uec: number,
    rec: number,
    hangar_value: number,
    total_spent: number,
    is_concierge: boolean,
    is_subscriber: boolean,

    register_time: Date,
    org_name: string | null,
    org_logo: string | null,
    org_rank: string | null
  }
  
  