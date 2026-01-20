import { HttpException, Inject, Injectable } from '@nestjs/common';
import { normalizeRemoteError } from '../auth/error/normalize-remote-error';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';

@Injectable()
export class LeaderboardService {
    constructor(@Inject('DASHBOARD_SERVICE') private readonly dashboardClient: ClientProxy,){    
    }

    async findByDashboard(dashboardId: number){
        try{const leaderboard= await firstValueFrom(
            this.dashboardClient.send({
                cmd : 'get_leaderboard_by_dashboard',
            }, {dashboardId})
        )
        return leaderboard;

        }catch(error){
            const payload = normalizeRemoteError(error);
            throw new HttpException(
                { error: payload },
                typeof payload.status === 'number' ? payload.status : 500,
            )
        }
    }
    async getTopRankings(dashboardId:number, limit?:number){
        try{
            const leaderboard = await firstValueFrom(
                this.dashboardClient.send({
                    cmd : 'get_top_rankings_by_dashboard',
                }, {dashboardId, limit})
            )
            return leaderboard;
        }catch(error){
            const payload = normalizeRemoteError(error);
            throw new HttpException(
                { error: payload },
                typeof payload.status === 'number' ? payload.status : 500,
            )
        }
    }
}


