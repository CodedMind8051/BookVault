export const DbName = "BookVaultDB"
export const ClusterName = "BookVaultCluster"
export const BaseEndPoint = "/api/v1"
export const AccessTokenExpiresDate = "1d"
export const RefreshTokenExpiresDate = "30d"
export const CookiesOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    signed: true
}